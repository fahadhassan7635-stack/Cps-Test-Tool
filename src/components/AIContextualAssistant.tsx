"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import { X, Sparkles, Newspaper, ArrowRight, ExternalLink, BookOpen, Layers } from 'lucide-react';

// ─────────────────────────────────────────────
// CUSTOM EVENT TO TRIGGER SIDEBAR FROM ANYWHERE
// ─────────────────────────────────────────────
export const OPEN_SIDEBAR_EVENT = 'fixedaim:open_context_sidebar';
export const OPEN_ASSISTANT_EVENT = OPEN_SIDEBAR_EVENT; // Backward-compatible alias

export interface SidebarOpenDetail {
  title?: string;
  prompt?: string;
  context?: string;
  badgeLabel?: string;
  topicId?: string;
}

export function openContextSidebar(detail: SidebarOpenDetail) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OPEN_SIDEBAR_EVENT, { detail }));
  }
}

export const triggerAssistant = openContextSidebar; // Backward-compatible alias

// ─────────────────────────────────────────────
// CONTEXT PILL COMPONENT (Click opens knowledge sidebar)
// ─────────────────────────────────────────────
export interface ContextPillProps {
  label: string;
  variant?: 'blue' | 'green' | 'purple' | 'amber' | 'cyan';
  icon?: 'newspaper' | 'sparkles' | 'none';
  query?: string;
  title?: string;
  topicId?: string;
  context?: string;
  className?: string;
}

export const ContextPill = memo(({
  label,
  variant = 'blue',
  icon = 'newspaper',
  query,
  title,
  topicId,
  context,
}: ContextPillProps) => {
  const getGradient = () => {
    switch (variant) {
      case 'green':
        return 'linear-gradient(135deg, #059669, #10b981)';
      case 'purple':
        return 'linear-gradient(135deg, #6366f1, #4f46e5)';
      case 'amber':
        return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'cyan':
        return 'linear-gradient(135deg, #0891b2, #06b6d4)';
      case 'blue':
      default:
        return 'linear-gradient(135deg, #1d4ed8, #2563eb)';
    }
  };

  const getBorder = () => {
    switch (variant) {
      case 'green':
        return 'rgba(167, 243, 208, 0.4)';
      case 'purple':
        return 'rgba(199, 210, 254, 0.4)';
      case 'amber':
        return 'rgba(253, 230, 138, 0.4)';
      case 'cyan':
        return 'rgba(165, 243, 252, 0.4)';
      case 'blue':
      default:
        return 'rgba(147, 197, 253, 0.4)';
    }
  };

  const getShadow = () => {
    switch (variant) {
      case 'green':
        return '0 2px 8px rgba(16, 185, 129, 0.35)';
      case 'purple':
        return '0 2px 8px rgba(99, 102, 241, 0.35)';
      case 'amber':
        return '0 2px 8px rgba(245, 158, 11, 0.35)';
      case 'cyan':
        return '0 2px 8px rgba(6, 182, 212, 0.35)';
      case 'blue':
      default:
        return '0 2px 8px rgba(37, 99, 235, 0.35)';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openContextSidebar({
      title,
      prompt: query || label,
      badgeLabel: label,
      topicId,
      context,
    });
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      title={`Read knowledge guide: ${label}`}
      aria-label={`Open context guide for ${label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 10px',
        borderRadius: '9999px',
        background: getGradient(),
        border: `1px solid ${getBorder()}`,
        boxShadow: getShadow(),
        color: '#ffffff',
        fontSize: '0.78rem',
        fontWeight: 700,
        lineHeight: 1.4,
        cursor: 'pointer',
        verticalAlign: 'middle',
        margin: '0 4px',
        textDecoration: 'none',
        transition: 'all 0.18s ease-in-out',
        userSelect: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-1px) scale(1.03)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
      }}
    >
      {icon === 'newspaper' && (
        <Newspaper size={12} strokeWidth={2.4} style={{ opacity: 0.95 }} />
      )}
      {icon === 'sparkles' && (
        <Sparkles size={12} strokeWidth={2.4} style={{ opacity: 0.95 }} />
      )}
      <span>{label}</span>
    </button>
  );
});
ContextPill.displayName = 'ContextPill';

// ─────────────────────────────────────────────
// KNOWLEDGE BASE (Instant zero-latency reader articles)
// Matching the exact layout and content of the user's reference
// ─────────────────────────────────────────────
export interface ArticleSection {
  heading?: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  badge: string;
  keywords: string[];
  sections: ArticleSection[];
}

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'pc-cleanup',
    title: "Optimizing Your Computer's Performance",
    badge: 'System Performance',
    keywords: ['clean your pc', 'optimizing', 'performance', 'pc maintenance', 'slow pc', 'latency', 'clean pc'],
    sections: [
      {
        paragraphs: [
          "Cleaning your PC involves both software and hardware maintenance to improve performance, free up storage space, and extend the lifespan of your device. This process can address issues like slow boot times, sluggish applications, and insufficient disk space that accumulate over time. Regularly cleaning your PC is a proactive step towards ensuring a smoother and more efficient computing experience, whether you use it for work, gaming, or general browsing."
        ]
      },
      {
        heading: "Software Cleanup: Decluttering Your Digital Space",
        paragraphs: [
          "One key aspect of cleaning your PC is managing the software installed. This includes uninstalling programs you no longer use, which frees up valuable disk space and can reduce background processes that consume resources. Using the built-in 'Add or Remove Programs' feature in Windows or similar tools in macOS allows you to identify and remove unwanted applications. Additionally, clearing temporary files and browser cache can significantly improve performance and responsiveness."
        ],
        bullets: [
          "Disable heavy startup applications in Windows Task Manager to reduce background CPU overhead.",
          "Clear temporary cache files (%temp%) regularly to prevent background indexing slowdowns.",
          "Ensure browser hardware acceleration is enabled to keep WebGL and high-frequency click listeners responsive."
        ]
      },
      {
        heading: "Hardware Maintenance: Keeping Components Running Cool",
        paragraphs: [
          "Dust buildup inside your PC case or laptop cooling vents causes thermal throttling, which slows down CPU and GPU clock speeds and increases input lag. Periodically dusting internal fans and heatsinks with compressed air keeps temperatures optimal during demanding tasks and competitive gaming sessions."
        ]
      },
      {
        heading: "Reducing Input Latency for Click Speed & Gaming",
        paragraphs: [
          "Ensure Windows 'Enhance pointer precision' is disabled in Mouse Properties to guarantee raw 1:1 hardware tracking. Close background applications like heavy browser tabs, video capture software, or torrent clients that consume CPU cycles during high-CPS testing."
        ]
      }
    ]
  },
  {
    id: 'cps-test',
    title: "What is a Click Speed Tester (CPS)?",
    badge: 'CPS Benchmark',
    keywords: ['click speed tester', 'cps test', 'what is cps', 'clicks per second', 'cps'],
    sections: [
      {
        paragraphs: [
          "A Click Speed Tester (CPS Test) benchmarks how many times you can actuate a mouse button per second. It is a core metric used across competitive gaming, Minecraft PvP, and esports aim training to evaluate physical finger dexterity and neuromuscular response."
        ]
      },
      {
        heading: "Community CPS Benchmarks & Skill Tiers",
        paragraphs: [
          "Player click speeds fall into distinct tiers based on technique and physical training:"
        ],
        bullets: [
          "Casual Baseline (5–7 CPS): Standard single-finger clicking used in daily browsing and casual games.",
          "Competitive Tier (8–12 CPS): Achieved by players using controlled finger rhythm or introductory jitter clicking.",
          "Elite PvP Tier (13–20+ CPS): Achieved by competitive Minecraft players using butterfly or drag clicking on low-debounce gaming mice."
        ]
      },
      {
        heading: "Sub-Millisecond Accuracy on FixedAim",
        paragraphs: [
          "Unlike generic web clickers that rely on basic browser event loops, FixedAim uses high-resolution performance.now() timestamps. This captures sub-millisecond actuation intervals and guarantees 100% fair, anti-cheat verified results."
        ]
      }
    ]
  },
  {
    id: 'kohl-test',
    title: "Kohi Click Test & Minecraft PvP Combat",
    badge: 'PvP Mechanics',
    keywords: ['kohi', 'kohl', 'kohi click test', 'kohl click test', 'minecraft pvp', 'combo'],
    sections: [
      {
        paragraphs: [
          "The Kohi Click Test originated on the renowned Kohi Minecraft hardcore PvP network. In Minecraft 1.8 combat mechanics, rapid click throughput directly determines your hit registration consistency and knockback reduction."
        ]
      },
      {
        heading: "Knockback Reduction & Combo-Locking",
        paragraphs: [
          "Attacking at 10–14 CPS ensures your hits register on the earliest damage tick (every 0.5s / 10 game ticks). When sprint-hitting at high CPS, the horizontal knockback received from your opponent is noticeably reduced, allowing you to maintain momentum and lock enemies into unescapable air combos."
        ],
        bullets: [
          "W-Tapping & Sprint Resets: Quickly tapping your sprint key between hits resets your sprint-knockback multiplier.",
          "Block Hitting: Tapping right click between hits blocks incoming sword damage while maintaining combo pressure.",
          "Crosshair Tracking: High CPS is useless without steady crosshair tracking on your opponent's hitbox."
        ]
      }
    ]
  },
  {
    id: 'jitter-clicking',
    title: "Mastering the Jitter Clicking Technique",
    badge: 'Click Technique',
    keywords: ['jitter', 'jitter clicking', 'jitter click', 'vibration', 'strain'],
    sections: [
      {
        paragraphs: [
          "Jitter Clicking is an advanced technique where you deliberately tense your forearm and wrist muscles to induce rapid, controlled micro-spasms. These tremors channel directly into your index fingertip, producing 10 to 14 clicks per second without moving your entire finger."
        ]
      },
      {
        heading: "Claw Grip & Aim Stabilization",
        paragraphs: [
          "Because jittering induces muscle tremors across your entire hand, maintaining cursor stability requires anchoring your grip. Players use a rigid claw or fingertip grip, planting their thumb and pinky firmly into the mouse sides to steer the crosshair while the index finger vibrates."
        ]
      },
      {
        heading: "Ergonomics & Health Precautions",
        paragraphs: [
          "Never tense your forearm for more than 10–15 seconds at a time. Extended muscle tension restricts blood flow and can lead to tendonitis or carpal tunnel syndrome. Take regular 30-second rest intervals and perform wrist flexion stretches between practice sets."
        ],
        bullets: [
          "Keep your wrist relaxed and elevated; do not plant your wrist bone flat against a hard desk.",
          "If you feel burning or persistent pain in your flexor tendons, stop immediately and rest.",
          "Warm up with light finger taps before attempting high-speed sprint sets."
        ]
      }
    ]
  },
  {
    id: 'butterfly-clicking',
    title: "Butterfly Clicking: Two-Finger Speed Optimization",
    badge: 'Click Technique',
    keywords: ['butterfly', 'butterfly clicking', 'two finger', 'flutter'],
    sections: [
      {
        paragraphs: [
          "Butterfly Clicking utilizes both your index and middle fingers on the same mouse button. By alternating the two fingers in a rapid see-saw motion, players can effortlessly achieve 15 to 25+ CPS while keeping their forearm completely relaxed."
        ]
      },
      {
        heading: "Debounce Delay & Double-Clicking Switches",
        paragraphs: [
          "On gaming mice with adjustable debounce firmware (such as the Glorious Model O or Bloody A70), setting debounce time to 0–4ms allows the electrical bounce of mechanical switches to register two hits per physical tap, reaching 20+ CPS with minimal effort."
        ]
      },
      {
        heading: "Server Anti-Cheat & Rule Compliance",
        paragraphs: [
          "Many competitive Minecraft servers (like Hypixel and Minemen) enforce automated click speed caps (usually 15–20 CPS). Excessively high double-clicking can trigger anti-cheat watchdog flags. Always verify server rules before competing."
        ]
      }
    ]
  },
  {
    id: 'drag-clicking',
    title: "Drag Clicking: Friction Physics & God-Bridging",
    badge: 'Bridging Mechanics',
    keywords: ['drag', 'drag clicking', 'friction', 'god-bridging', 'bridging'],
    sections: [
      {
        paragraphs: [
          "Drag Clicking involves pulling your finger across a textured mouse button with subtle downward pressure. Skin friction causes the finger to skip rapidly across the plastic, actuating the switch at extraordinary speeds of 25 to 60+ CPS."
        ]
      },
      {
        heading: "Surface Texture & Grip Tape",
        paragraphs: [
          "Standard glossy mouse buttons lack the surface friction required for drag clicking. Players apply specialized matte grip tape to enhance micro-skips and select mechanical switches with low debounce thresholds."
        ]
      },
      {
        heading: "God-Bridging and Breezily Bridging",
        paragraphs: [
          "Drag clicking is primarily utilized in Minecraft bridging modes, allowing players to sprint backwards and place continuous blocks without crouching. However, it severely compromises crosshair tracking, making it unsuitable for standard gunplay or PvP combat."
        ]
      }
    ]
  },
  {
    id: 'gaming-mouse',
    title: "Gaming Mouse Hardware: Switches, Debounce & Sensors",
    badge: 'Hardware Guide',
    keywords: ['gaming', 'mouse', 'gaming mouse', 'debounce', 'switches', 'optical', 'razer', 'logitech', 'glorious'],
    sections: [
      {
        paragraphs: [
          "Your mouse hardware directly determines your physical click registration ceiling. Sensor accuracy, switch actuation mechanisms, and firmware debounce filters all shape competitive performance."
        ]
      },
      {
        heading: "Mechanical vs. Optical Switches",
        paragraphs: [
          "Traditional mechanical switches use metal leaf contacts that bounce upon impact, requiring a debounce delay to filter out false double clicks. Optical switches (found in the Razer Viper V3 and Logitech G Pro X Superlight 2) use infrared light beams, eliminating debounce delay entirely and delivering instantaneous sub-0.2ms actuation."
        ]
      },
      {
        heading: "Polling Rates: 1000Hz up to 8000Hz",
        paragraphs: [
          "A standard 1000Hz polling rate updates your cursor position every 1 millisecond. Advanced 4000Hz and 8000Hz sensors reduce report latency down to 0.125ms, delivering smoother crosshair tracking on 240Hz+ gaming monitors."
        ],
        bullets: [
          "Low Debounce Mice: Glorious Model O, Bloody A70, Roccat Kain 120 (best for butterfly/drag clicking).",
          "Optical Esports Mice: Razer DeathAdder V3 Pro, Logitech G Pro X Superlight 2 (best for raw aim & zero latency).",
          "Lightweight Shells: Sub-65g mice minimize forearm fatigue during extended clicking sessions."
        ]
      }
    ]
  },
  {
    id: 'web-tools',
    title: "Web Tools for Gamers & Precision Training",
    badge: 'Web Tools',
    keywords: ['web tools', 'try web tools', 'tools', 'browser tools', 'online tools'],
    sections: [
      {
        paragraphs: [
          "FixedAim provides a zero-install suite of browser-based performance testing tools built with WebAssembly, WebGL, and high-precision timing APIs. Whether you need to benchmark click speed, measure reaction time, or inspect mouse hardware, everything runs client-side with zero latency."
        ]
      },
      {
        heading: "Available FixedAim Training Modules",
        paragraphs: [
          "Explore the complete suite to develop well-rounded gaming mechanics:"
        ],
        bullets: [
          "CPS Test (1s, 2s, 5s, 10s, 60s): Test primary and secondary click speed with real-time graphs.",
          "Aim Trainer & Target Tracker: Practice micro-adjustments, flick shots, and moving target tracking.",
          "Reaction Time Benchmark: Test your visual reflex and reaction speed in milliseconds.",
          "Scroll Wheel & Key Visualizer: Check mouse wheel steps and mechanical keyboard switch actuation."
        ]
      }
    ]
  },
  {
    id: 'track-traffic',
    title: "Network Latency & Packet Consistency in Gaming",
    badge: 'Network Guide',
    keywords: ['track web traffic', 'traffic', 'network', 'ping', 'latency', 'packet loss'],
    sections: [
      {
        paragraphs: [
          "In online multiplayer games, client-side click speed must synchronize with game servers over the network. Network jitter, bufferbloat, and packet loss can invalidate your high CPS by dropping hit registration packets."
        ]
      },
      {
        heading: "Ethernet vs. Wi-Fi Input Consistency",
        paragraphs: [
          "Wi-Fi networks suffer from intermittent interference from household appliances and channel congestion. Always connect via wired Cat6 Ethernet to maintain consistent sub-millisecond packet intervals and eliminate dropped click packets."
        ],
        bullets: [
          "Enable QoS (Quality of Service) on your router to prioritize gaming UDP packets over video streaming.",
          "Ensure your monitor refresh rate is set to its maximum (144Hz, 240Hz, or 360Hz) in Windows Display Settings.",
          "Close peer-to-peer torrent clients and cloud sync apps while competing."
        ]
      }
    ]
  },
  {
    id: 'click-test',
    title: "Choosing the Right Click Test Duration",
    badge: 'Training Modes',
    keywords: ['click test', 'duration', 'durations', '1s', '2s', '5s', '10s', 'modes'],
    sections: [
      {
        paragraphs: [
          "FixedAim supports multiple test intervals ranging from 1 second up to 100 seconds. Choosing the right duration targets specific neuromuscular adaptations."
        ]
      },
      {
        heading: "Sprint vs. Endurance Durations",
        paragraphs: [
          "Tailor your testing session to your gaming discipline:"
        ],
        bullets: [
          "1s & 2s Sprint: Measures maximum explosive burst speed and initial reaction velocity.",
          "5s Standard: The globally recognized competitive benchmark for Minecraft PvP and general CPS rankings.",
          "10s & 30s Stamina: Tests sustained muscle rhythm and prevents premature hand cramping during extended skirmishes."
        ]
      }
    ]
  },
  {
    id: 'pc-shortcuts',
    title: "100+ Essential PC & Laptop Shortcuts for Everyday Life",
    badge: 'Shortcut Mastery',
    keywords: ['shortcuts', 'shortcut keys', 'short key', 'pc shortcuts', 'laptop shortcuts', 'windows shortcuts', 'mac shortcuts', '100+ short key', 'keyboard shortcuts', 'hotkeys'],
    sections: [
      {
        paragraphs: [
          "Mastering keyboard shortcuts is the single highest-return computer skill you can develop. Research shows keyboard shortcuts save the average computer user over 64 hours per year by eliminating mouse travel and repetitive menu navigation. Below are 116 indispensable shortcuts organized across Windows, macOS, web browsing, text editing, file management, development, and spreadsheets."
        ]
      },
      {
        heading: "1. Windows 10 & 11 System Navigation (20 Shortcuts)",
        paragraphs: [
          "Universal shortcuts built into the Windows operating system for window management, virtual desktops, and system utilities:"
        ],
        bullets: [
          "Win + E: Open File Explorer immediately from any application.",
          "Win + D: Minimize all windows and show desktop (press again to restore).",
          "Win + L: Instantly lock your workstation or laptop.",
          "Win + V: Open Cloud Clipboard History (access multiple copied texts and screenshots).",
          "Win + Shift + S: Open Snipping Tool for custom area, window, or fullscreen capture.",
          "Win + I: Open Windows Settings dashboard.",
          "Win + R: Launch Run dialog (enter cmd, msconfig, %temp%, or app names).",
          "Win + X: Open Power User Quick Link menu (Task Manager, Device Manager, Terminal).",
          "Win + Tab: Open Task View with timeline and virtual desktops.",
          "Win + Left / Right Arrow: Snap active window to left or right half of display.",
          "Win + Up Arrow: Maximize window or snap to upper display quadrant.",
          "Win + Down Arrow: Restore window size or minimize to taskbar.",
          "Win + . (Period) or Win + ;: Open native Windows Emoji, GIF, Kaomoji & Symbol picker.",
          "Win + G: Launch Xbox Game Bar for live FPS monitoring, audio mixing & clip capture.",
          "Win + M: Minimize all open windows simultaneously.",
          "Win + Shift + M: Restore all windows minimized via Win + M.",
          "Ctrl + Shift + Esc: Open Task Manager directly (bypasses Ctrl+Alt+Del interrupt).",
          "Alt + Tab: Fast visual application switcher (hold Alt, tap Tab to cycle).",
          "Alt + F4: Close active program or prompt Windows Shut Down dialog.",
          "Win + 1 through 9: Open or focus pinned taskbar applications by numeric position."
        ]
      },
      {
        heading: "2. Text Editing & Word Processing Essentials (18 Shortcuts)",
        paragraphs: [
          "Accelerate typing and document creation across Word, Google Docs, Notepad, and email clients:"
        ],
        bullets: [
          "Ctrl + A: Select all contents in active document, page, or text field.",
          "Ctrl + C: Copy selected text, image, or file to clipboard.",
          "Ctrl + X: Cut selected item and store in clipboard.",
          "Ctrl + V: Paste clipboard contents at active cursor position.",
          "Ctrl + Z: Undo last action or keystroke.",
          "Ctrl + Y: Redo previously undone action.",
          "Ctrl + F: Open in-page Find search bar.",
          "Ctrl + H: Open Find and Replace dialog.",
          "Ctrl + B: Toggle Bold styling on selected text.",
          "Ctrl + I: Toggle Italic styling on selected text.",
          "Ctrl + U: Toggle Underline styling on selected text.",
          "Ctrl + S: Immediately save active document or file.",
          "Ctrl + P: Open Print preview and printer selection.",
          "Ctrl + Backspace: Delete entire preceding word instead of single characters.",
          "Ctrl + Delete: Delete entire subsequent word to the right of cursor.",
          "Ctrl + Left / Right Arrow: Jump cursor word-by-word across text lines.",
          "Ctrl + Shift + Left / Right Arrow: Highlight and select text word-by-word.",
          "Shift + Home / End: Highlight all text from cursor to start or end of line."
        ]
      },
      {
        heading: "3. Web Browser & Tab Navigation (18 Shortcuts)",
        paragraphs: [
          "Speed up web navigation across Google Chrome, Microsoft Edge, Brave, and Mozilla Firefox:"
        ],
        bullets: [
          "Ctrl + T: Open a new blank browser tab.",
          "Ctrl + W: Close the currently active browser tab.",
          "Ctrl + Shift + T: Reopen the most recently closed tab (saves accidentally closed work).",
          "Ctrl + N: Open a completely new browser window.",
          "Ctrl + Shift + N: Open an Incognito / Private browsing session.",
          "Ctrl + Tab: Cycle forward to the next open tab.",
          "Ctrl + Shift + Tab: Cycle backward to the previous open tab.",
          "Ctrl + 1 through 8: Jump directly to the tab at that specific position.",
          "Ctrl + 9: Jump directly to the very last open tab.",
          "Ctrl + L or Alt + D: Highlight address bar URL for instant replacement search.",
          "Ctrl + R or F5: Reload active webpage.",
          "Ctrl + Shift + R or Ctrl + F5: Hard refresh page bypassing stored browser cache.",
          "Ctrl + D: Bookmark current webpage.",
          "Ctrl + J: Open browser Downloads manager.",
          "Ctrl + H: Open full browsing history.",
          "Ctrl + Plus (+) / Minus (-): Zoom in or zoom out page viewport.",
          "Ctrl + 0: Reset browser zoom level to 100% default.",
          "Alt + Left Arrow / Backspace: Navigate back to preceding page in history."
        ]
      },
      {
        heading: "4. File Explorer & Desktop Management (15 Shortcuts)",
        paragraphs: [
          "Manage directory structures, files, folders, and properties with zero mouse reliance:"
        ],
        bullets: [
          "Ctrl + Shift + N: Create a brand new folder in current directory.",
          "F2: Instantly rename selected file or folder.",
          "F3: Jump cursor to File Explorer search field.",
          "F4: Display address bar dropdown path history.",
          "F5: Refresh folder contents and file directory state.",
          "Alt + Enter: Open full Properties window for selected file or drive.",
          "Alt + Up Arrow: Navigate up one directory level in folder hierarchy.",
          "Alt + Left / Right Arrow: Move backward or forward in folder navigation history.",
          "Shift + Delete: Permanently delete file bypassing Recycle Bin.",
          "Ctrl + Shift + E: Expand all folder trees in navigation sidebar.",
          "Alt + P: Toggle File Explorer Preview pane on the right side.",
          "Alt + Shift + P: Toggle File Details pane for metadata inspection.",
          "Ctrl + Mouse Wheel: Dynamically scale folder icon sizes (Extra Large to Details).",
          "Ctrl + W: Close current File Explorer window.",
          "Backspace: Move up to parent folder in Explorer history."
        ]
      },
      {
        heading: "5. macOS Productivity Equivalents (15 Shortcuts)",
        paragraphs: [
          "Equivalent essential Command and Option shortcuts for MacBook and Mac desktop users:"
        ],
        bullets: [
          "Cmd + Space: Open Spotlight Search for instant app launching, calculations & conversions.",
          "Cmd + Tab: Fast application switcher with dock icons.",
          "Cmd + Q: Completely quit and terminate active application.",
          "Cmd + W: Close active window or browser tab.",
          "Cmd + C / Cmd + V / Cmd + X: Standard Copy, Paste, and Cut on macOS.",
          "Cmd + Option + Esc: Open Force Quit Applications dialog.",
          "Cmd + Shift + 3: Full-screen screenshot saved directly to Desktop.",
          "Cmd + Shift + 4: Crosshair area screenshot capture.",
          "Cmd + Shift + 5: Open macOS Screenshot & Screen Recording utility toolbar.",
          "Cmd + H: Hide active application windows.",
          "Cmd + Option + H: Hide all applications except the current foreground window.",
          "Cmd + M: Minimize active window to macOS Dock.",
          "Cmd + Z / Cmd + Shift + Z: Undo and Redo operations.",
          "Option + Delete: Delete entire word backward from cursor.",
          "Cmd + Delete: Move selected file directly to Bin / Trash."
        ]
      },
      {
        heading: "6. Coding, Development & Terminal Hotkeys (15 Shortcuts)",
        paragraphs: [
          "Accelerate software engineering and code editing in VS Code, Sublime, and terminal shells:"
        ],
        bullets: [
          "Ctrl + P: Quick Open file by name across the entire project repository.",
          "Ctrl + Shift + P or F1: Open IDE Command Palette to execute any editor action.",
          "Ctrl + ` (Backtick): Toggle built-in integrated terminal console.",
          "Ctrl + /: Toggle line comment on/off for selected code block.",
          "Alt + Up / Down Arrow: Shift current line or block up or down.",
          "Shift + Alt + Up / Down Arrow: Duplicate current line up or down.",
          "Ctrl + D: Add next occurrence of selected word to multi-cursor editing.",
          "Ctrl + Shift + L: Select all occurrences of word across the entire file.",
          "Ctrl + B: Toggle primary editor sidebar and file tree visibility.",
          "Ctrl + Shift + F: Global multi-file search across entire codebase.",
          "Alt + Click: Insert multiple cursor positions anywhere in editor.",
          "F12: Go to Definition of function, class, or variable.",
          "Alt + F12: Peek Definition inline without navigating away from code.",
          "Ctrl + Space: Manually trigger IntelliSense autocomplete suggestions.",
          "Ctrl + K, Ctrl + S: Open keyboard shortcuts configuration and keybindings manager."
        ]
      },
      {
        heading: "7. Excel & Spreadsheet Mastery (15 Shortcuts)",
        paragraphs: [
          "Power-user spreadsheet shortcuts for Microsoft Excel and Google Sheets:"
        ],
        bullets: [
          "F4: Repeat last action or toggle absolute cell reference ($A$1 -> A$1 -> $A1 -> A1).",
          "Ctrl + Arrow Keys: Jump immediately to edge of current data region.",
          "Ctrl + Shift + Arrow Keys: Highlight all cells to edge of data region.",
          "Shift + Space: Highlight entire active worksheet row.",
          "Ctrl + Space: Highlight entire active worksheet column.",
          "Ctrl + Shift + Plus (+): Insert new cell, row, or column.",
          "Ctrl + Minus (-): Delete selected cell, row, or column.",
          "Alt + =: Instantly insert AutoSum formula (=SUM()) on adjacent cells.",
          "Ctrl + ; (Semicolon): Insert current calendar date into active cell.",
          "Ctrl + Shift + : (Colon): Insert current clock time into active cell.",
          "Ctrl + 1: Open Format Cells dialog box (currency, percentages, borders).",
          "Ctrl + Page Down / Page Up: Switch forward or backward between worksheet tabs.",
          "F2: Edit active cell with cursor placed at end of text/formula.",
          "Ctrl + Enter: Populate all highlighted cells with current formula entry.",
          "Ctrl + ` (Backtick): Toggle between showing cell values and formula text."
        ]
      }
    ]
  },
  {
    id: 'keyboard-troubleshooting',
    title: "Keyboard Ghosting, Key Rollover (NKRO) & Matrix Bugs",
    badge: 'Hardware Diagnostic',
    keywords: ['key rollover', 'nkro', 'ghosting', 'key rollover software', 'keybord analyse bug', 'matrix bug', 'anti-ghosting', 'chatter', 'erased keyboard', 'dead keys'],
    sections: [
      {
        paragraphs: [
          "Keyboard ghosting and dropped keystrokes occur when internal electrical grid circuits cannot differentiate simultaneous inputs. When multiple keys sharing an electrical row and column are actuated together on budget membrane keyboards, the controller either blocks additional inputs or falsely registers unpressed adjacent keys (ghosting)."
        ]
      },
      {
        heading: "Understanding Rollover Ratings: 2KRO, 6KRO & Full NKRO",
        paragraphs: [
          "Key Rollover (KRO) defines how many keys can be pressed simultaneously and registered reliably:"
        ],
        bullets: [
          "2KRO / 3KRO (Budget Membrane): Only 2 or 3 keys can be held. Frequently causes dropped strafes (W+A+Shift) during gaming.",
          "6KRO (Legacy USB): Up to 6 simultaneous alphanumeric keys plus modifiers. Standard for older USB HID specifications.",
          "Full NKRO (N-Key Rollover): Every single key on the keyboard can be pressed simultaneously with zero ghosting or blocking. Achieved using discrete SMD diodes on every mechanical switch contact."
        ]
      },
      {
        heading: "Diagnosing Mechanical Key Chatter & Double-Typing",
        paragraphs: [
          "Key chatter occurs when oxidized mechanical switch leaves bounce rapidly upon contact. Instead of a single actuation, the switch sends 2–4 pulses in under 20ms. The Key Visualizer live log allows you to spot double-actuations instantly."
        ]
      },
      {
        heading: "Identifying Mystery or Erased Keycaps",
        paragraphs: [
          "If keycap legends are rubbed off or worn from heavy use, open FixedAim Key Visualizer and press the key. The on-screen virtual keyboard highlights the exact character code and location in real time."
        ]
      }
    ]
  },
  {
    id: 'streamer-kbm-overlay',
    title: "On-Screen Keystroke Visualizers for Speedruns & OBS Streaming",
    badge: 'Streaming & Esports',
    keywords: ['kbm on screen', 'speedruns', 'input visualizer', 'keystroke visualizer', 'obs overlay', 'key tracker screen', 'real-time keyboard input', 'speedrun kbm'],
    sections: [
      {
        paragraphs: [
          "In competitive speedrunning communities (e.g. Minecraft, Celeste, Trackmania, Super Mario 64), leaderboard moderators require on-screen keyboard and mouse input overlays to verify runs against macros, TAS (Tool-Assisted Speedruns), and hardware automation."
        ]
      },
      {
        heading: "How Streamers Embed Browser Input Displays",
        paragraphs: [
          "FixedAim Key Visualizer is designed for clean integration with OBS Studio and Streamlabs:"
        ],
        bullets: [
          "Window / Browser Source: Capture FixedAim in OBS with zero background CPU overhead.",
          "Live Visual Proof: Viewers can observe movement techniques, strafe timing, and combo actuations in real time.",
          "Zero Installation: Unlike desktop utilities like Vovsoft or NohBoard, FixedAim runs directly in the browser without third-party drivers."
        ]
      }
    ]
  },
  {
    id: 'tab-switch-detector',
    title: "Tab Switch Detection, Window Focus & Anti-Cheat Mechanics",
    badge: 'Browser Mechanics',
    keywords: ['tab switch detector', 'tab switch detection', 'focus', 'blur', 'tab switch', 'window focus', 'visibilitychange'],
    sections: [
      {
        paragraphs: [
          "Modern web applications, proctoring systems, online exams, and competitive browser games monitor whether a user switches tabs or navigates away from the active window. This is achieved using browser document visibility APIs."
        ]
      },
      {
        heading: "How Browsers Detect Tab Switching",
        paragraphs: [
          "Three core JavaScript APIs handle window state and tab focus:"
        ],
        bullets: [
          "document.visibilityState & visibilitychange: Fires whenever a tab is minimized or switched to background.",
          "window.onblur & window.onfocus: Detects when the user clicks outside the browser window or opens another application.",
          "Keyboard Tab Interception: Pressing Tab cycles through interactive DOM elements unless event.preventDefault() is explicitly configured."
        ]
      },
      {
        heading: "FixedAim Zero-Scroll Tab Handling",
        paragraphs: [
          "On FixedAim Key Visualizer, the Tab key is captured with passive: false event listeners. This allows you to test Tab switch illumination without browser viewport jumps."
        ]
      }
    ]
  }
];

// Helper to find matching article
export function findKnowledgeArticle(queryOrKeyword?: string, topicId?: string): KnowledgeArticle | null {
  if (topicId) {
    const found = KNOWLEDGE_ARTICLES.find(a => a.id === topicId);
    if (found) return found;
  }
  if (!queryOrKeyword) return KNOWLEDGE_ARTICLES[0];

  const lower = queryOrKeyword.toLowerCase();
  for (const article of KNOWLEDGE_ARTICLES) {
    if (article.id === lower) return article;
    if (article.keywords.some(k => lower.includes(k) || k.includes(lower))) {
      return article;
    }
  }
  return null;
}

// ─────────────────────────────────────────────
// DISCOVER MORE WIDGET (Matching the user screenshot)
// ─────────────────────────────────────────────
export const DiscoverMoreCard = memo(() => {
  return (
    <div
      style={{
        background: '#161d2b',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div
        style={{
          fontSize: '1.15rem',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <BookOpen size={20} color="var(--neon-green, #00ff88)" />
        <span>Discover more</span>
      </div>

      {/* Quick Topic Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Try Web Tools', topicId: 'web-tools' },
          { label: 'Clean Your PC', topicId: 'pc-cleanup' },
          { label: 'Track Web Traffic', topicId: 'track-traffic' },
        ].map(item => (
          <button
            key={item.topicId}
            type="button"
            onClick={() => openContextSidebar({ topicId: item.topicId, title: item.label })}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.9rem',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              color: '#e2e8f0',
              fontSize: '0.92rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.transform = 'translateX(3px)';
              e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
            }}
          >
            <span>{item.label}</span>
            <ArrowRight size={15} style={{ opacity: 0.6 }} />
          </button>
        ))}
      </div>

      {/* Contextual Color Pills (matching screenshot) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <ContextPill
          label="Clicks Per Second"
          variant="purple"
          topicId="cps-test"
          icon="none"
        />
        <ContextPill
          label="Kohl Click Test"
          variant="amber"
          topicId="kohl-test"
          icon="none"
        />
        <ContextPill
          label="Jitter Clicking"
          variant="green"
          topicId="jitter-clicking"
          icon="none"
        />
        <ContextPill
          label="Gaming Mouse"
          variant="blue"
          topicId="gaming-mouse"
          icon="none"
        />
        <ContextPill
          label="Butterfly Clicking"
          variant="cyan"
          topicId="butterfly-clicking"
          icon="none"
        />
      </div>
    </div>
  );
});
DiscoverMoreCard.displayName = 'DiscoverMoreCard';

// ─────────────────────────────────────────────
// KEYBOARD DISCOVER MORE WIDGET (Matching user screenshot)
// ─────────────────────────────────────────────
export const KeyboardDiscoverCard = memo(() => {
  return (
    <div
      style={{
        background: '#161d2b',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div
        style={{
          fontSize: '1.15rem',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <BookOpen size={20} color="var(--neon-green, #00ff88)" />
        <span>Discover Keyboard & Shortcut Guides</span>
      </div>

      {/* Quick Topic Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
        {[
          { label: '⚡ 100+ Essential PC & Laptop Shortcuts Guide', topicId: 'pc-shortcuts' },
          { label: '🛡️ Key Rollover (NKRO) & Matrix Bug Guide', topicId: 'keyboard-troubleshooting' },
          { label: '📺 Speedruns & Streaming KBM Overlay Guide', topicId: 'streamer-kbm-overlay' },
          { label: '👁️ Tab Switch Detection & Anti-Cheat Guide', topicId: 'tab-switch-detector' },
        ].map(item => (
          <button
            key={item.topicId}
            type="button"
            onClick={() => openContextSidebar({ topicId: item.topicId, title: item.label })}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.9rem',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              color: '#e2e8f0',
              fontSize: '0.92rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.transform = 'translateX(3px)';
              e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
            }}
          >
            <span>{item.label}</span>
            <ArrowRight size={15} style={{ opacity: 0.6 }} />
          </button>
        ))}
      </div>

      {/* Contextual Color Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <ContextPill
          label="100+ Short Keys"
          variant="purple"
          topicId="pc-shortcuts"
          icon="none"
        />
        <ContextPill
          label="NKRO Software"
          variant="amber"
          topicId="keyboard-troubleshooting"
          icon="none"
        />
        <ContextPill
          label="Tab Switch Detector"
          variant="green"
          topicId="tab-switch-detector"
          icon="none"
        />
        <ContextPill
          label="Speedrun KBM"
          variant="blue"
          topicId="streamer-kbm-overlay"
          icon="none"
        />
        <ContextPill
          label="Fix Erased Keys"
          variant="cyan"
          topicId="keyboard-troubleshooting"
          icon="none"
        />
      </div>
    </div>
  );
});
KeyboardDiscoverCard.displayName = 'KeyboardDiscoverCard';


// ─────────────────────────────────────────────
// CONTEXT SIDEBAR DRAWER (Reader Panel — No Chat, No Message Input)
// Matching the white reader card overlay in user's screenshot
// ─────────────────────────────────────────────
export function ContextSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [loading, setLoading] = useState(false);

  // Close sidebar handler
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Listen for open events
  useEffect(() => {
    const handleOpen = async (e: Event) => {
      const customEvent = e as CustomEvent<SidebarOpenDetail>;
      const detail = customEvent.detail;
      if (!detail) return;

      const matchedArticle = findKnowledgeArticle(detail.prompt || detail.badgeLabel, detail.topicId);

      if (matchedArticle) {
        setArticle(matchedArticle);
        setIsOpen(true);
      } else {
        // Fallback or dynamic fetch from API if not in static base
        setIsOpen(true);
        setLoading(true);
        try {
          const res = await fetch('/api/ai-assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: detail.prompt || detail.badgeLabel,
              context: detail.context,
            }),
          });
          const data = await res.json();
          if (data && data.response) {
            // Parse response into an article structure
            const lines = (data.response as string).split('\n');
            const parsedSections: ArticleSection[] = [];
            let currentHeading: string | undefined = undefined;
            let currentParagraphs: string[] = [];
            let currentBullets: string[] = [];

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('#')) {
                if (currentParagraphs.length || currentBullets.length) {
                  parsedSections.push({
                    heading: currentHeading,
                    paragraphs: currentParagraphs,
                    bullets: currentBullets.length ? currentBullets : undefined,
                  });
                  currentParagraphs = [];
                  currentBullets = [];
                }
                currentHeading = trimmed.replace(/^#+\s*/, '');
              } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                currentBullets.push(trimmed.replace(/^[-*]\s*/, ''));
              } else if (trimmed.length > 0) {
                currentParagraphs.push(trimmed);
              }
            }

            if (currentParagraphs.length || currentBullets.length) {
              parsedSections.push({
                heading: currentHeading,
                paragraphs: currentParagraphs,
                bullets: currentBullets.length ? currentBullets : undefined,
              });
            }

            setArticle({
              id: 'dynamic-guide',
              title: detail.title || detail.badgeLabel || 'Context Guide',
              badge: 'FixedAim Guide',
              keywords: [],
              sections: parsedSections.length ? parsedSections : [
                { paragraphs: [data.response] }
              ],
            });
          } else {
            // Default to pc-cleanup article
            setArticle(KNOWLEDGE_ARTICLES[0]);
          }
        } catch {
          setArticle(KNOWLEDGE_ARTICLES[0]);
        } finally {
          setLoading(false);
        }
      }
    };

    window.addEventListener(OPEN_SIDEBAR_EVENT, handleOpen);
    return () => {
      window.removeEventListener(OPEN_SIDEBAR_EVENT, handleOpen);
    };
  }, []);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen && !article) return null;

  return (
    <>
      {/* ── BACKDROP OVERLAY ── */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 9998,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
        aria-hidden="true"
      />

      {/* ── SIDEBAR DRAWER PANEL (Matching the white card in screenshot) ── */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={article?.title || 'Knowledge Sidebar'}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(540px, 92vw)',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '24px',
          borderBottomLeftRadius: '24px',
          boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.35)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(105%)',
          transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          color: '#1f2937',
        }}
      >
        {/* Top Header Bar with Close Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.75rem 0.75rem',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '9999px',
                background: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {article?.badge || 'Knowledge Guide'}
            </span>
          </div>

          {/* Close '✕' Button (matching user screenshot top-right) */}
          <button
            onClick={handleClose}
            type="button"
            aria-label="Close knowledge guide"
            title="Close (Esc)"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              color: '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.06)';
              e.currentTarget.style.color = '#111827';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <X size={22} strokeWidth={2.4} />
          </button>
        </div>

        {/* Scrollable Article Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem 2rem 2.5rem',
            overscrollBehavior: 'contain',
          }}
        >
          {loading ? (
            /* Skeleton Loading State */
            <div style={{ paddingTop: '1rem' }}>
              <div
                style={{
                  height: '28px',
                  width: '75%',
                  background: '#e5e7eb',
                  borderRadius: '6px',
                  marginBottom: '1.5rem',
                  animation: 'pulse 1.5s infinite',
                }}
              />
              <div
                style={{
                  height: '16px',
                  width: '100%',
                  background: '#f3f4f6',
                  borderRadius: '4px',
                  marginBottom: '0.75rem',
                }}
              />
              <div
                style={{
                  height: '16px',
                  width: '90%',
                  background: '#f3f4f6',
                  borderRadius: '4px',
                  marginBottom: '0.75rem',
                }}
              />
              <div
                style={{
                  height: '16px',
                  width: '95%',
                  background: '#f3f4f6',
                  borderRadius: '4px',
                  marginBottom: '1.5rem',
                }}
              />
              <div
                style={{
                  height: '22px',
                  width: '60%',
                  background: '#e5e7eb',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                }}
              />
              <div
                style={{
                  height: '16px',
                  width: '100%',
                  background: '#f3f4f6',
                  borderRadius: '4px',
                  marginBottom: '0.75rem',
                }}
              />
            </div>
          ) : article ? (
            <div>
              {/* Main Title (e.g. Optimizing Your Computer's Performance) */}
              <h2
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  color: '#111827',
                  lineHeight: 1.3,
                  margin: '0 0 1.25rem 0',
                }}
              >
                {article.title}
              </h2>

              {/* Sections with Headings, Paragraphs & Bullets */}
              {article.sections.map((section, sIdx) => (
                <div key={sIdx} style={{ marginBottom: '1.5rem' }}>
                  {section.heading && (
                    <h3
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: '#111827',
                        lineHeight: 1.4,
                        margin: '1.4rem 0 0.65rem 0',
                      }}
                    >
                      {section.heading}
                    </h3>
                  )}

                  {section.paragraphs.map((p, pIdx) => (
                    <p
                      key={pIdx}
                      style={{
                        fontSize: '0.96rem',
                        lineHeight: 1.68,
                        color: '#374151',
                        margin: '0 0 0.95rem 0',
                      }}
                    >
                      {p}
                    </p>
                  ))}

                  {section.bullets && section.bullets.length > 0 && (
                    <ul
                      style={{
                        margin: '0.5rem 0 1rem 0',
                        paddingLeft: '1.35rem',
                        color: '#374151',
                        fontSize: '0.94rem',
                        lineHeight: 1.65,
                      }}
                    >
                      {section.bullets.map((b, bIdx) => (
                        <li key={bIdx} style={{ marginBottom: '0.4rem' }}>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Clean Footer Bar */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
            background: '#fafafa',
            borderBottomLeftRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
            FixedAim Performance Knowledge
          </span>
          <button
            onClick={handleClose}
            type="button"
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              background: '#ffffff',
              color: '#374151',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          >
            Done reading
          </button>
        </div>
      </aside>
    </>
  );
}

// ─────────────────────────────────────────────
// BACKWARD-COMPATIBLE ALIAS
// Completely removes chat interface & floating button
// ─────────────────────────────────────────────
export const AIContextualAssistant = ContextSidebar;
