import { createSlice } from "@reduxjs/toolkit"

const initialState: {domainName: string | null} = {
    domainName: null
}

const DomainSlice = createSlice({
    name: 'Domain',
    initialState,
    reducers: {
        changeDomain: (state, action)=>{
            if(typeof action.payload == 'string' && action.payload.length > 0){
                state.domainName = action.payload;
            }
            else{
                state.domainName = null
            }
        }
    }
})

export default DomainSlice;

export const {changeDomain} = DomainSlice.actions