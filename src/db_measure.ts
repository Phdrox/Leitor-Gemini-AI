import Sequelize from "sequelize";
import { database } from "./db";
//modelo de tabela para cria no banco de dados com o Sequelize 
export const db_measure=database.define('db_measure',{
    customer_code:{
        type:Sequelize.STRING(100),
        primaryKey:true,
        allowNull:false,
    },
    image_url:{
     type:Sequelize.STRING(200),
     allowNull:false,
    },
    measure_datetime:{
        type:Sequelize.DATE,
        allowNull:false,
    },
    measure_type:{
        type:Sequelize.STRING(6),
        allowNull:false,
    },
    measure_value:{
        type:Sequelize.INTEGER,
        allowNull:false,
    },
    measure_uuid:{
        type:Sequelize.STRING,
        allowNull:false,
    },
    confirmed_value:{
        type:Sequelize.INTEGER,
        allowNull:true
    }

})