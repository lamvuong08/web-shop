require('dotenv').config();

//import các ngân cần dùng
const express = require('express');
const configViewEngine = require('./config/viewEngine');
const apiRoutes = require('./routes/api');
const connection = require('./config/database');
const { getHomepage } = require('./controllers/homecontroller');
const cors = require('cors');

//cấu hình app là express
const app = express();

//cấu hình port, nếu tim thay port trong env, không thi trả về 8888
const port = process.env.PORT || 8088;

app.use(cors()); //config cors
app.use(express.json()); //config req.body cho json
app.use(express.urlencoded({ extended: true })); // for form data
configViewEngine(app); //config template engine

//config route cho view ejs
const webAPI = express.Router();
webAPI.get('/', getHomepage);
app.use('/', webAPI);

//khai báo route cho API
app.use('/v1/api', apiRoutes);

(async () => {
    try {
        //kết nối database using Sequelize (MySQL)
        await connection();

        //lắng nghe port trong env
        app.listen(port, () => {
            console.log(`Backend Nodejs App Listening on port ${port}`);
        });
    } catch (error) {
        console.log(">> Error connect to DB: ", error);
    }
})();