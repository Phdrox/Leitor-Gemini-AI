import {Sequelize} from "sequelize";
//conecta o banco de dados do docker com o Sequelize
export const database=new Sequelize('backendshopper','root','backdb1234',{
    dialect:'mysql',
    host:'db_sistema',
 })


