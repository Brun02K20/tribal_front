import multer from 'multer';

const upload = multer({ dest: 'temp/' }); // guardo temporalmente los archivos subidos

export {upload}