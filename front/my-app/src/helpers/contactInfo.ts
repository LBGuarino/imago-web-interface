import { ContactFormInputs } from "@/validations/validationSchema";
import axios, { AxiosError } from "axios"

export const contactInfo = async (data: ContactFormInputs) => {
    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/contact`, data);
        return response.data;
    } catch (err) {
        const error = err as AxiosError;
        throw error;
    }
}

export default contactInfo;