const fs = require('fs');
const path = require('path');

function handleCss(dir, publicPath, postfix) {
  // 获取生成图片资源路径
  let convertPublicPath = publicPath;
  if (convertPublicPath) {
    const pathDoteArr = ['.', '?', '/'];
    pathDoteArr.map(el => {
      const reg = new RegExp(`\\${el}`, 'g');
      convertPublicPath = convertPublicPath.replace(reg, `\\${el}`);
    });
  } else {
    convertPublicPath = '';
  }

  const files = fs.readdirSync(dir);
  files.forEach(function(file) {
    const filePath = `${dir}/${file}`;
    const info = fs.statSync(filePath);
    if (info.isDirectory()) {
      handleCss(filePath, publicPath, postfix);
    } else {
      if (file.match(/\.css$/) && !file.match(/\.webp\.css$/)) {
        let result = fs.readFileSync(filePath, 'utf-8');
        result = result.replace(/\.(jpg|jpeg|png)/g, img => {return `${img}?${postfix}`});
        fs.writeFileSync(path.join(dir, file.replace(/\.css/, '.webp.css')), result, 'utf8');
      }
    }
  });
}

module.exports = handleCss;
