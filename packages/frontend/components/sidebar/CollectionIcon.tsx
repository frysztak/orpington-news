import React from 'react';
import { BsCodeSlash } from '@react-icons/all-files/bs/BsCodeSlash';
import { BiCodeBlock } from '@react-icons/all-files/bi/BiCodeBlock';
import { BsTerminal } from '@react-icons/all-files/bs/BsTerminal';
import { DiAndroid } from '@react-icons/all-files/di/DiAndroid';
import { DiFsharp } from '@react-icons/all-files/di/DiFsharp';
import { DiGo } from '@react-icons/all-files/di/DiGo';
import { DiErlang } from '@react-icons/all-files/di/DiErlang';
import { ImDatabase } from '@react-icons/all-files/im/ImDatabase';
import { ImHackernews } from '@react-icons/all-files/im/ImHackernews';
import { SiAngular } from '@react-icons/all-files/si/SiAngular';
import { SiApple } from '@react-icons/all-files/si/SiApple';
import { SiArchlinux } from '@react-icons/all-files/si/SiArchlinux';
import { SiClojure } from '@react-icons/all-files/si/SiClojure';
import { SiDebian } from '@react-icons/all-files/si/SiDebian';
import { SiDeno } from '@react-icons/all-files/si/SiDeno';
import { SiDjango } from '@react-icons/all-files/si/SiDjango';
import { SiDocker } from '@react-icons/all-files/si/SiDocker';
import { SiDotNet } from '@react-icons/all-files/si/SiDotNet';
import { SiMozillafirefox } from '@react-icons/all-files/si/SiMozillafirefox';
import { SiGit } from '@react-icons/all-files/si/SiGit';
import { SiGithub } from '@react-icons/all-files/si/SiGithub';
import { SiGnu } from '@react-icons/all-files/si/SiGnu';
import { SiGooglechrome } from '@react-icons/all-files/si/SiGooglechrome';
import { SiHaskell } from '@react-icons/all-files/si/SiHaskell';
import { SiHtml5 } from '@react-icons/all-files/si/SiHtml5';
import { SiJava } from '@react-icons/all-files/si/SiJava';
import { SiJavascript } from '@react-icons/all-files/si/SiJavascript';
import { SiLinux } from '@react-icons/all-files/si/SiLinux';
import { SiMarkdown } from '@react-icons/all-files/si/SiMarkdown';
import { SiMozilla } from '@react-icons/all-files/si/SiMozilla';
import { SiNeovim } from '@react-icons/all-files/si/SiNeovim';
import { SiNextDotJs } from '@react-icons/all-files/si/SiNextDotJs';
import { SiNpm } from '@react-icons/all-files/si/SiNpm';
import { SiPhp } from '@react-icons/all-files/si/SiPhp';
import { SiPython } from '@react-icons/all-files/si/SiPython';
import { SiRaspberrypi } from '@react-icons/all-files/si/SiRaspberrypi';
import { SiReact } from '@react-icons/all-files/si/SiReact';
import { SiRedux } from '@react-icons/all-files/si/SiRedux';
import { SiRust } from '@react-icons/all-files/si/SiRust';
import { SiStackoverflow } from '@react-icons/all-files/si/SiStackoverflow';
import { SiSwift } from '@react-icons/all-files/si/SiSwift';
import { SiTypescript } from '@react-icons/all-files/si/SiTypescript';
import { SiUbuntu } from '@react-icons/all-files/si/SiUbuntu';
import { SiWordpress } from '@react-icons/all-files/si/SiWordpress';

import { CollectionIconType } from '@orpington-news/shared';

export interface CollectionIconProps {
  icon?: CollectionIconType;
}

const icons: Record<CollectionIconType, React.FC> = {
  Android: DiAndroid,
  Angular: SiAngular,
  Apple: SiApple,
  Archlinux: SiArchlinux,
  Chrome: SiGooglechrome,
  Clojure: SiClojure,
  Code: BsCodeSlash,
  CodeBadge: BiCodeBlock,
  Database: ImDatabase,
  Debian: SiDebian,
  Deno: SiDeno,
  Django: SiDjango,
  Docker: SiDocker,
  Dotnet: SiDotNet,
  Erlang: DiErlang,
  Firefox: SiMozillafirefox,
  Fsharp: DiFsharp,
  Git: SiGit,
  Github: SiGithub,
  GNU: SiGnu,
  Golang: DiGo,
  HackerNews: ImHackernews,
  Haskell: SiHaskell,
  HTML: SiHtml5,
  Java: SiJava,
  JavaScript: SiJavascript,
  Linux: SiLinux,
  Markdown: SiMarkdown,
  Mozilla: SiMozilla,
  NextJS: SiNextDotJs,
  NPM: SiNpm,
  PHP: SiPhp,
  Python: SiPython,
  RaspberryPI: SiRaspberrypi,
  React: SiReact,
  Redux: SiRedux,
  Rust: SiRust,
  StackOverflow: SiStackoverflow,
  Swift: SiSwift,
  Terminal: BsTerminal,
  TypeScript: SiTypescript,
  Ubuntu: SiUbuntu,
  Vim: SiNeovim,
  Wordpress: SiWordpress,
};

export const getCollectionIcon = (iconType?: CollectionIconType): React.FC => {
  return icons[iconType ?? 'Code'];
};
