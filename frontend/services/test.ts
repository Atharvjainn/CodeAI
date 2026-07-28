import {api} from '@/lib/api'

export const getusers = async() => {
    try {
        const response = await api.get("/users");
        console.log(response.data); 
    } catch (error) {
        console.log("There is something wrong on the frontend !!",error);
    }
}