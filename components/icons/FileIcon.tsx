// @ts-nocheck
import React from 'react';
import { 
  SiHtml5, SiCss, SiJavascript, SiTypescript, SiReact, 
  SiVite, SiJson, SiPython, SiMarkdown 
} from 'react-icons/si';
import { 
  VscFileCode, VscSettingsGear, VscFile 
} from 'react-icons/vsc';
import { DiNodejsSmall } from 'react-icons/di';
import { FaJava } from 'react-icons/fa';

interface FileIconProps {
  name?: string;
  className?: string;
}

const FileIcon: React.FC<FileIconProps> = ({ name, className }) => {
  if (!name) return <VscFile className={className} />;

  const ext = name.split('.').pop()?.toLowerCase();
  
  // Specific files
  if (name === 'package.json' || name === 'package-lock.json') {
    return <DiNodejsSmall className={className} style={{ color: '#83CD29' }} />;
  }
  if (name === 'vite.config.ts' || name === 'vite.config.js') {
    return <SiVite className={className} style={{ color: '#646CFF' }} />;
  }
  if (name === 'README.md') {
    return <SiMarkdown className={className} style={{ color: '#5BC0DE' }} />;
  }
  if (name.startsWith('.env')) {
    return <VscSettingsGear className={className} style={{ color: '#F6D365' }} />;
  }
  if (name === '.gitignore') {
    return <VscFileCode className={className} style={{ color: '#F14E32' }} />;
  }

  // File extensions
  switch (ext) {
    case 'html': 
      return <SiHtml5 className={className} style={{ color: '#E34F26' }} />;
    case 'css': 
      return <SiCss className={className} style={{ color: '#1572B6' }} />;
    case 'js':
    case 'cjs':
    case 'mjs': 
      return <SiJavascript className={className} style={{ color: '#F7DF1E' }} />;
    case 'ts': 
      return <SiTypescript className={className} style={{ color: '#3178C6' }} />;
    case 'jsx': 
    case 'tsx': 
      return <SiReact className={className} style={{ color: '#61DAFB' }} />;
    case 'json': 
      return <SiJson className={className} style={{ color: '#CBCB41' }} />;
    case 'py': 
      return <SiPython className={className} style={{ color: '#3776AB' }} />;
    case 'java': 
      return <FaJava className={className} style={{ color: '#E37400' }} />;
    case 'c': 
    case 'cpp':
      return <VscFileCode className={className} style={{ color: '#00599C' }} />;
    default:
      return <VscFile className={className} style={{ color: '#8b9eb0' }} />;
  }
};

export default FileIcon;
