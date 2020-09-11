import mongoose from 'mongoose'

export class Registration{
	connectionUrl = 'mongodb://localhost:27017/crm'
	Schema :any
	Registration :any
	session :any

	constructor(){
    	this.Schema = mongoose.Schema
    	mongoose.connect(this.connectionUrl,{ useNewUrlParser: true, useUnifiedTopology: true  })
    	mongoose.connection.on('open',() => {
        	console.log('connection to MongoDB is success')
    	})
	}

	getRegistrationModel(){
    	this.Registration = new this.Schema({
        	'username':String,
        	'password': String,   	
    	})
    	let RegistrationModel = mongoose.model('registration', this.Registration)
    	return RegistrationModel
	}

	async startTrasaction(){
    	this.session = await mongoose.startSession()
    	this.session.startTransaction()
    	return this.session
	}

	async commitTransaction(){
    	await this.session.commitTransaction();
	}

	async abortTransaction(){
    	await this.session.abortTransaction();
	}

 endSession(){
 	this.session.endSession()
	}
}

export class RegistrationDao{
	async create(reg:any){
    	let registraion = new Registration()
    	let RegistrationModelClass = registraion.getRegistrationModel()
    	let registrationModel = new RegistrationModelClass(reg)
    	let error = registrationModel.validateSync()
    
    	if(error){
            console.log("error occured ", error)
            return error
        }
    	else{
        	try{
                await registraion.startTrasaction()
                console.log ("saving model")
                let result =  registrationModel.save()
                
            	await registraion.commitTransaction()
            	return result;
        	} catch{
            	registraion.abortTransaction()
        	} finally{
            	registraion.endSession()
        	}
    	}      	 
	}
}

let dao = new RegistrationDao()
let result= dao.create({"username":"anil", "password":"admin123"})

result.then ((o)=>{
    console.log (o)
})

result.catch( (e)=>{
    console.log (e)
})
