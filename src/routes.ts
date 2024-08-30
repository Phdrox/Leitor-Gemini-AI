import { GoogleAIFileManager } from '@google/generative-ai/server';
import {Request, Router,Response } from "express";
import dotenv from "dotenv";
import multer from "multer";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db_measure } from './db_measure';
import { writeFile } from 'fs';
import { createHash,randomUUID } from 'crypto';
import { database } from './db';

//pega as variáveis de ambiente, a função route do express e a função de upload com framework multer
dotenv.config();
const router=Router();
const apikey:any=process.env.GEMINI_API_KEY
const upload=multer({})

//ativa o route no middleware no express framework
router.use((req,res,next)=>{
    next()
})

//interface para tipar os dados provindos do banco de dados
interface IDbMeasure{
  customer_code:string;
  measure_uuid:string;
  measure_datetime:Date;
  measure_type:string;
  confirmed_value:number;
  image_url:string;
  measure_value:number;
  
}

//Cria uma tabela no banco de dados
(async ()=>{
 
 db_measure
 await database.sync();
})()

router.post('/upload',upload.single('image'), async (req:Request|any,res:Response)=>{
  //pega os dados do body
    const image=req.file?.originalname;
    const customer_code=req.body.custumer_code;
    const measure_datetime=req.body.measure_datatime;
    const measure_type=req.body.measure_type;
    const verify=image && customer_code && measure_datetime && measure_type;
    const measure_uuid=randomUUID().toString();
  
    //trata image em base64
    const imageBase64=()=>{
    const image=req.file?.buffer.toString('base64');
    const encodedSha256 = createHash('sha256').update(image).digest('hex');
    const imagePath = `${encodedSha256}.jpeg`;
    writeFile(`upload/${imagePath}`,req.file?.buffer,(err)=>{
            console.log(err)
    })
    return imagePath;
   }
   //função que realizar a leitura do código pela Gemini AI 
    const getImageWhithAI= async (image:string)=>{
        const fileManager=new GoogleAIFileManager(apikey);
        const uploadResponse= await fileManager.uploadFile(`upload/${image}`,{mimeType:'image/jpeg',displayName:'Images measure_value'})
        const getResponse= await fileManager.getFile(uploadResponse.file.name)
        const genAI=new GoogleGenerativeAI(apikey);
        const model=genAI.getGenerativeModel({model:'gemini-1.5-pro'})
        const result= await model.generateContent([{fileData:{mimeType:uploadResponse.file.mimeType,fileUri:uploadResponse.file.uri}},{text:'extrair somente o codigo numerico'}])
        res.status(200).json({"image_url":`http://localhost/upload/${image}`,"measure_value":result.response.text(),"measure_uuid":measure_uuid})
        db_measure.create({
            customer_code:customer_code.toUpperCase(),
            image_url:`${image}`,
            measure_datetime:measure_datetime,
            measure_type:measure_type.toUpperCase(),
            measure_value:result.response.text(),
            measure_uuid:measure_uuid,
            createdAt:Date.now()
        })
    }
  
  //Verificação para retornar respostas na api
    if(verify){
       if((await db_measure.findAll({where:{measure_datetime:measure_datetime}})).length>=1){
        res.status(409).json({"error_code": "DOUBLE_REPORT","error_description": "Leitura do mês já realizada"})
       }else{getImageWhithAI(imageBase64())}
    }else{res.status(400).json({"error_code":"INVALID_DATA","error_description":"Os dados fornecidos no corpo da requisição são inválidos"})}
})


router.patch('/confirm',async (req:Request,res:Response)=>{
  //pega os dados do body
    const measure_uuid=req.body.measure_uuid;
    const confirmed_value=req.body.confirmed_value;
    const verify=measure_uuid && confirmed_value;
    
    //pega os dados já existente do banco de dados, no caso measure_uuid e confirmed_value
    let codeIA:any=await (await db_measure.findAll({where:{measure_uuid:measure_uuid}}))
    let confirmIA:any=await (await db_measure.findAll({where:{confirmed_value:confirmed_value}}))
    
    //realiza a verificação para as respostas
    if(verify){ 
        if(codeIA.length>=1 ){
            if(confirmIA.length>=1){
                if(codeIA.forEach((item:IDbMeasure)=>item.measure_value)==confirmed_value){
                    res.status(409).json({"error_code":"MEASURE_NOT_FOUND","error_description": "Leitura do mês já realizada"})
                  }else if((await db_measure.findAll({where:{measure_uuid:measure_uuid,confirmed_value:confirmed_value}})).length>=1){
                    res.status(409).json({"error_code":"CONFIRMATION_DUPLICATE","error_description": "Leitura do mês já realizada"})
                  }else{
                    const update:any=await db_measure.findOne({where:{measure_uuid:measure_uuid}})
                    update.confirmed_value=confirmed_value;
                    update.save();
                    res.status(200).json({"success":true})
                  } 
            }else{res.status(404).json({"error_code":"MEASURE_NOT_FOUND","error_description": "Leitura do mês já realizada"})}
        }else{res.status(404).json({"error_code":"MEASURE_NOT_FOUND","error_description": "Leitura do mês já realizada"})}
    }else{res.status(400).json({"error_code": "INVALID_DATA","error_description":"Os dados fornecidos no corpo da requisição são inválidos"})}
})

router.get('/:customer_code/list', async (req:Request,res:Response)=>{
    //pega os valores do paramêtro e da query
    const measureQuery=req.query.measure_type?.toString().toUpperCase()
    const customer_codeId=req.params.customer_code.toString().toUpperCase()
    
    //função que irá retornar a resposta de status 200 da rota get
    function getData(data:[]){
      const customer_coder=data.map((item:IDbMeasure)=>item.customer_code)
            const dataJSON:any=[]
              data.forEach((item:IDbMeasure)=>{dataJSON.push({
                "measure_uuid": item.measure_uuid,
                "measure_datetime": item.measure_datetime,
                "measure_type": item.measure_type,
                "has_confirmed":item.confirmed_value?true:false,
                "image_url": `http://localhost:80/upload/${item.image_url}`
              })})
              res.status(200).json({ "customer_code":customer_coder, "measures": dataJSON})
    }
    
    //verificação para demais respostas
    if(measureQuery){
          switch(measureQuery){
            case "WATER":
             if(customer_codeId && measureQuery){
               const dataQuery:any= await db_measure.findAll({where:{
               customer_code:req.params.customer_code,
               measure_type:req.query.measure_type
               }});
               getData(dataQuery)
             }
            break;
            case "GAS":
                if(customer_codeId && measureQuery){
                 const dataQuery:any= await db_measure.findAll({where:{
                 customer_code:req.params.customer_code,
                 measure_type:req.query.measure_type
                 }});
                 getData(dataQuery)
                }
            break;
            default:
                res.status(400).json({"error_code": "INVALID_TYPE","error_description": "Tipo de medição não permitida"})
            break;
          }
    } else if(customer_codeId){
       const data:any= await db_measure.findAll({where:{customer_code:req.params.customer_code}});
       getData(data)
    }else{res.status(404).json({"error_code": "MEASURES_NOT_FOUND","error_description": "Nenhuma leitura encontrada"})}
})

export default router;