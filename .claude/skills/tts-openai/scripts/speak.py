#!/usr/bin/env python3
"""
OpenAI TTS - A say-command-like interface for OpenAI's Text-to-Speech API.

Usage:
    speak.py "Hello world"
    speak.py -f input.txt
    speak.py -v nova -f input.txt
    speak.py -o output.mp3 -f input.txt
    cat file.txt | speak.py

Chunked playback (paragraph-by-paragraph):
    speak.py --chunked -f input.txt -d /path/to/output/dir
    speak.py --resume -d /path/to/output/dir
    speak.py --stop

Requires:
    - .env file with OPENAI_API_KEY in the scripts directory
    - pip install openai
"""

import argparse
import json
import os
import re
import signal
import sys
import subprocess
import tempfile
from datetime import datetime
from pathlib import Path

try:
    from openai import OpenAI
except ImportError:
    print("Error: openai package not installed. Run: pip install openai", file=sys.stderr)
    sys.exit(1)


def load_env():
    """Load environment variables from .env file in the scripts directory."""
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    os.environ[key] = value


VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]
DEFAULT_VOICE = "nova"
DEFAULT_MODEL = "tts-1"

# Global flag for graceful shutdown
_stop_requested = False


def signal_handler(signum, frame):
    """Handle interrupt signals gracefully."""
    global _stop_requested
    _stop_requested = True
    print("\n⏸️  Playback paused. Use --resume to continue.", file=sys.stderr)


def split_into_paragraphs(text: str) -> list[str]:
    """Split text into paragraphs, preserving meaningful chunks."""
    # Split on double newlines or more
    paragraphs = re.split(r'\n\s*\n', text.strip())

    # Filter out empty paragraphs and clean up
    result = []
    for p in paragraphs:
        p = p.strip()
        if p:
            # If paragraph is very short, it might be a header - combine with next
            result.append(p)

    return result


def load_playback_state(output_dir: Path) -> dict:
    """Load playback state from playback.json."""
    playback_file = output_dir / "playback.json"
    if playback_file.exists():
        with open(playback_file, "r") as f:
            return json.load(f)
    return None


def save_playback_state(output_dir: Path, state: dict) -> None:
    """Save playback state to playback.json."""
    playback_file = output_dir / "playback.json"
    state["last_updated"] = datetime.now().isoformat()
    with open(playback_file, "w") as f:
        json.dump(state, f, indent=2)


def generate_paragraph_audio(
    client: OpenAI,
    paragraphs: list[str],
    output_dir: Path,
    voice: str,
    model: str,
    start_from: int = 0
) -> None:
    """Generate audio files for each paragraph."""
    global _stop_requested

    paragraphs_dir = output_dir / "paragraphs"
    paragraphs_dir.mkdir(exist_ok=True)

    total = len(paragraphs)

    for i, paragraph in enumerate(paragraphs):
        if i < start_from:
            continue

        if _stop_requested:
            break

        para_num = i + 1
        audio_file = paragraphs_dir / f"{para_num:03d}.mp3"

        # Skip if already generated
        if audio_file.exists():
            continue

        print(f"🎙️  Generating audio {para_num}/{total}...", file=sys.stderr)

        try:
            with client.audio.speech.with_streaming_response.create(
                model=model,
                voice=voice,
                input=paragraph
            ) as response:
                response.stream_to_file(str(audio_file))
        except Exception as e:
            print(f"Error generating paragraph {para_num}: {e}", file=sys.stderr)
            raise


def get_audio_duration(audio_file: Path) -> float:
    """Get duration of an audio file in seconds using afinfo (macOS)."""
    try:
        result = subprocess.run(
            ["afinfo", "-b", str(audio_file)],
            capture_output=True,
            text=True,
            check=True
        )
        # afinfo -b outputs just the duration in seconds
        return float(result.stdout.strip())
    except (subprocess.CalledProcessError, ValueError):
        # Fallback: estimate ~3 seconds per paragraph
        return 3.0


def format_time(seconds: float) -> str:
    """Format seconds as MM:SS or HH:MM:SS."""
    if seconds < 0:
        return "0:00"

    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)

    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes}:{secs:02d}"


def play_paragraphs(output_dir: Path, start_from: int = 0) -> int:
    """Play paragraph audio files sequentially. Returns last played paragraph."""
    global _stop_requested

    paragraphs_dir = output_dir / "paragraphs"
    if not paragraphs_dir.exists():
        print("Error: No paragraphs directory found.", file=sys.stderr)
        return start_from

    # Get sorted list of audio files
    audio_files = sorted(paragraphs_dir.glob("*.mp3"))
    total = len(audio_files)

    if total == 0:
        print("Error: No audio files found.", file=sys.stderr)
        return start_from

    # Calculate durations for time estimate
    print("Calculating duration...", end="\r", file=sys.stderr, flush=True)
    durations = [get_audio_duration(af) for af in audio_files]

    current = start_from

    for i, audio_file in enumerate(audio_files):
        if i < start_from:
            continue

        if _stop_requested:
            print("", file=sys.stderr)  # New line
            return current

        current = i
        para_num = i + 1
        time_remaining = sum(durations[i:])

        # Build progress bar: [████████░░░░░░░░░░░░] 3/14 | 2:35 remaining
        bar_width = 20
        filled = int((para_num / total) * bar_width)
        bar = "█" * filled + "░" * (bar_width - filled)
        progress = f"\r[{bar}] {para_num}/{total} | {format_time(time_remaining)} remaining"
        print(progress, end="", file=sys.stderr, flush=True)

        # Save state BEFORE playing - if terminated mid-playback, resume from this paragraph
        save_playback_state(output_dir, {
            "current_paragraph": current,
            "total_paragraphs": total,
            "status": "playing"
        })

        try:
            # Play audio (macOS)
            subprocess.run(["afplay", str(audio_file)], check=True)

            # Paragraph completed successfully - update state to next paragraph
            save_playback_state(output_dir, {
                "current_paragraph": current + 1,
                "total_paragraphs": total,
                "status": "playing" if (current + 1) < total else "completed"
            })

        except (subprocess.CalledProcessError, KeyboardInterrupt):
            # Terminated - state already saved, will resume from current paragraph
            print("", file=sys.stderr)  # New line after progress
            return current

    # Clear line and show completion with full bar
    bar = "█" * 20
    print(f"\r[{bar}] ✅ Complete ({total} paragraphs)           ", file=sys.stderr)

    save_playback_state(output_dir, {
        "current_paragraph": total,
        "total_paragraphs": total,
        "status": "completed"
    })

    return total


def chunked_speak(
    text: str,
    output_dir: str,
    voice: str = DEFAULT_VOICE,
    model: str = DEFAULT_MODEL,
    generate_only: bool = False
) -> None:
    """Generate and play audio paragraph by paragraph."""
    global _stop_requested

    load_env()

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY not found in .env file.", file=sys.stderr)
        sys.exit(1)

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Split text into paragraphs
    paragraphs = split_into_paragraphs(text)

    if not paragraphs:
        print("Error: No paragraphs found in text.", file=sys.stderr)
        sys.exit(1)

    print(f"📄 Split into {len(paragraphs)} paragraphs.", file=sys.stderr)

    # Save paragraphs info
    meta_file = output_path / "paragraphs.json"
    with open(meta_file, "w") as f:
        json.dump({
            "total": len(paragraphs),
            "paragraphs": paragraphs,
            "voice": voice,
            "model": model,
            "generated": datetime.now().isoformat()
        }, f, indent=2)

    # Initialize playback state
    save_playback_state(output_path, {
        "current_paragraph": 0,
        "total_paragraphs": len(paragraphs),
        "status": "generating"
    })

    # Generate audio for all paragraphs
    client = OpenAI(api_key=api_key)
    generate_paragraph_audio(client, paragraphs, output_path, voice, model)

    if _stop_requested:
        return

    if generate_only:
        save_playback_state(output_path, {
            "current_paragraph": 0,
            "total_paragraphs": len(paragraphs),
            "status": "ready"
        })
        print(f"✅ Generated {len(paragraphs)} audio files.", file=sys.stderr)
        return

    # Play all paragraphs
    play_paragraphs(output_path, start_from=0)


def resume_playback(output_dir: str) -> None:
    """Resume playback from last position."""
    output_path = Path(output_dir)

    if not output_path.exists():
        print(f"Error: Directory not found: {output_dir}", file=sys.stderr)
        sys.exit(1)

    state = load_playback_state(output_path)

    if not state:
        print("Error: No playback state found. Use --chunked to start.", file=sys.stderr)
        sys.exit(1)

    if state["status"] == "completed":
        print("✅ Playback already completed. Starting from beginning.", file=sys.stderr)
        start_from = 0
    else:
        start_from = state["current_paragraph"]
        print(f"▶️  Resuming from paragraph {start_from + 1}/{state['total_paragraphs']}...", file=sys.stderr)

    play_paragraphs(output_path, start_from=start_from)


def stop_playback() -> None:
    """Stop any currently playing audio."""
    try:
        subprocess.run(["pkill", "-f", "afplay"], check=False)
        print("⏹️  Playback stopped.", file=sys.stderr)
    except Exception as e:
        print(f"Error stopping playback: {e}", file=sys.stderr)


def speak(text: str, voice: str = DEFAULT_VOICE, output_file: str = None, model: str = DEFAULT_MODEL) -> None:
    """Convert text to speech using OpenAI TTS API (single file mode)."""

    load_env()

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY not found in .env file.", file=sys.stderr)
        sys.exit(1)

    if not text.strip():
        print("Error: No text provided.", file=sys.stderr)
        sys.exit(1)

    if voice not in VOICES:
        print(f"Error: Invalid voice '{voice}'. Choose from: {', '.join(VOICES)}", file=sys.stderr)
        sys.exit(1)

    client = OpenAI(api_key=api_key)

    try:
        if output_file:
            with client.audio.speech.with_streaming_response.create(
                model=model,
                voice=voice,
                input=text
            ) as response:
                response.stream_to_file(output_file)
            print(f"Audio saved to: {output_file}")
        else:
            # Play directly using a temp file
            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
                tmp_path = tmp.name

            with client.audio.speech.with_streaming_response.create(
                model=model,
                voice=voice,
                input=text
            ) as response:
                response.stream_to_file(tmp_path)

            try:
                # macOS: use afplay
                subprocess.run(["afplay", tmp_path], check=True)
            finally:
                os.unlink(tmp_path)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="OpenAI TTS - Convert text to speech (say-command compatible)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"""
Voices: {', '.join(VOICES)}

Examples:
    # Single file mode (original behavior)
    %(prog)s "Hello world"
    %(prog)s -f document.txt
    %(prog)s -v nova -f document.txt
    %(prog)s -o output.mp3 -f document.txt

    # Chunked paragraph mode (for long documents)
    %(prog)s --chunked -f document.txt -d /path/to/output
    %(prog)s --chunked --generate-only -f doc.txt -d /path/to/output
    %(prog)s --resume -d /path/to/output
    %(prog)s --stop
        """
    )

    parser.add_argument("text", nargs="?", help="Text to speak")
    parser.add_argument("-f", "--file", metavar="FILE", help="Read text from file")
    parser.add_argument("-v", "--voice", default=DEFAULT_VOICE, choices=VOICES,
                        help=f"Voice to use (default: {DEFAULT_VOICE})")
    parser.add_argument("-o", "--output", metavar="FILE", help="Save audio to file instead of playing")
    parser.add_argument("--model", default=DEFAULT_MODEL, choices=["tts-1", "tts-1-hd"],
                        help=f"Model to use (default: {DEFAULT_MODEL})")
    parser.add_argument("--list-voices", action="store_true", help="List available voices")

    # Chunked playback options
    parser.add_argument("--chunked", action="store_true",
                        help="Enable paragraph-by-paragraph audio generation and playback")
    parser.add_argument("-d", "--dir", metavar="DIR",
                        help="Output directory for chunked audio files")
    parser.add_argument("--generate-only", action="store_true",
                        help="Only generate audio files, don't play (use with --chunked)")
    parser.add_argument("--resume", action="store_true",
                        help="Resume playback from last position")
    parser.add_argument("--stop", action="store_true",
                        help="Stop currently playing audio")
    parser.add_argument("--status", action="store_true",
                        help="Show playback status for a directory")

    args = parser.parse_args()

    # Set up signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    if args.list_voices:
        print("Available voices:")
        for v in VOICES:
            marker = " (default)" if v == DEFAULT_VOICE else ""
            print(f"  {v}{marker}")
        sys.exit(0)

    if args.stop:
        stop_playback()
        sys.exit(0)

    if args.status:
        if not args.dir:
            print("Error: --status requires -d/--dir", file=sys.stderr)
            sys.exit(1)
        state = load_playback_state(Path(args.dir))
        if state:
            print(f"Status: {state['status']}")
            print(f"Progress: {state['current_paragraph']}/{state['total_paragraphs']}")
            print(f"Last updated: {state.get('last_updated', 'unknown')}")
        else:
            print("No playback state found.")
        sys.exit(0)

    if args.resume:
        if not args.dir:
            print("Error: --resume requires -d/--dir", file=sys.stderr)
            sys.exit(1)
        resume_playback(args.dir)
        sys.exit(0)

    # Get text from various sources
    text = None

    if args.file:
        if args.file == "-":
            text = sys.stdin.read()
        else:
            try:
                with open(args.file, "r") as f:
                    text = f.read()
            except FileNotFoundError:
                print(f"Error: File not found: {args.file}", file=sys.stderr)
                sys.exit(1)
    elif args.text:
        text = args.text
    elif not sys.stdin.isatty():
        text = sys.stdin.read()
    else:
        parser.print_help()
        sys.exit(1)

    if args.chunked:
        if not args.dir:
            print("Error: --chunked requires -d/--dir", file=sys.stderr)
            sys.exit(1)
        chunked_speak(text, args.dir, voice=args.voice, model=args.model,
                      generate_only=args.generate_only)
    else:
        speak(text, voice=args.voice, output_file=args.output, model=args.model)


if __name__ == "__main__":
    main()
