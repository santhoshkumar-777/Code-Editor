// @ts-nocheck
import React from 'react';
import { 
  VscFolder, VscFolderOpened, VscFolderLibrary, VscSymbolMisc, VscPackage 
} from 'react-icons/vsc';

interface FolderIconProps {
  name?: string;
  isOpen?: boolean;
  className?: string;
}

const FolderIcon: React.FC<FolderIconProps> = ({ name, isOpen, className }) => {
  const defaultFolColor = '#5e99da';
  
  if (!name) {
    return isOpen ? 
      <VscFolderOpened className={className} style={{color: defaultFolColor}} /> : 
      <VscFolder className={className} style={{color: defaultFolColor}} />;
  }

  const lowerName = name.toLowerCase();
  
  // Specific folders
  if (lowerName === 'components') {
    return <VscFolderLibrary className={className} style={{ color: '#4080D0' }} />;
  }
  if (lowerName === 'hooks') {
    return <VscSymbolMisc className={className} style={{ color: '#8A5EB7' }} />;
  }
  if (lowerName === 'node_modules') {
    return <VscPackage className={className} style={{ color: '#83CD29' }} />;
  }
  if (lowerName === 'services' || lowerName === 'api') {
    return <VscFolderLibrary className={className} style={{ color: '#E8CA58' }} />;
  }

  return isOpen ? 
    <VscFolderOpened className={className} style={{color: defaultFolColor}} /> : 
    <VscFolder className={className} style={{color: defaultFolColor}} />;
};

export default FolderIcon;
