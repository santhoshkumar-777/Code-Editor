
import { CodeSnippet } from '../types';

export const DEFAULT_SNIPPETS: CodeSnippet[] = [
  {
    id: 'def-html-5',
    name: 'html5',
    description: 'HTML5 Boilerplate',
    code: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Document</title>\n</head>\n<body>\n  \n</body>\n</html>',
    isDefault: true
  },
  {
    id: 'def-js-clog',
    name: 'clog',
    description: 'Console Log',
    code: 'console.log($0);',
    isDefault: true
  },
  {
    id: 'def-js-fetch',
    name: 'fetch-api',
    description: 'Fetch API GET request',
    code: 'fetch("${1:url}")\n  .then(res => res.json())\n  .then(data => {\n    console.log(data);\n    $0\n  });',
    isDefault: true
  },
  {
    id: 'def-react-rfc',
    name: 'rfc',
    description: 'React Functional Component',
    code: "import React from 'react';\n\nexport const ${1:ComponentName} = () => {\n  return (\n    <div>\n      $0\n    </div>\n  );\n};",
    isDefault: true
  },
  {
    id: 'def-css-flex',
    name: 'flex-center',
    description: 'Flexbox Center',
    code: 'display: flex;\njustify-content: center;\nalign-items: center;',
    isDefault: true
  },
  {
    id: 'def-py-main',
    name: 'pymain',
    description: 'Python Main Block',
    code: 'if __name__ == "__main__":\n    ${1:pass}\n    $0',
    isDefault: true
  }
];
