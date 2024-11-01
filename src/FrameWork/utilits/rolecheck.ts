import { Request,Response,NextFunction } from "express";


const roleCheck=(req:Request,res:Response,next:NextFunction)=>{
    const{role}=req.query

    if(role!=='user'){
        return res.json({message:'not authorised',token:false})
    }
    next();
}

export default roleCheck