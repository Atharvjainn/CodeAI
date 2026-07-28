import {api} from '@/lib/api'


export const getusers = async() => {
    try {
        const response = await api.get("/users");
        console.log(response.data); 
    } catch (error) {
        console.log("There is something wrong on the frontend !!",error);
    }
}


export const generateProblem = async(prompt : string) => {
   try {
        const response = await api.post("/ai/generate-problem",{prompt});
        console.log(response); 
        return response.data
    } catch (error : any) {
        console.log("There is something wrong on the frontend !!",error.response.data);
    }
}