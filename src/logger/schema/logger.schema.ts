import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({timestamps: true})
export class Logger {
    @Prop()
    email: string
    
    @Prop()
    action: string
}

export const LoggerSchema = SchemaFactory.createForClass(Logger);