import { PayloadAction, createSlice } from "@reduxjs/toolkit"

const initialState: {domainName: string | null, auth: string|null} = {
    domainName: null,
    auth: null,
}

const DomainSlice = createSlice({
    name: 'Domain',
    initialState,
    reducers: {
        changeDomain: (state, action:PayloadAction<{domainName: string, auth: string}>)=>{
            console.log('auth strings are, ', action.payload)
            if(action.payload.domainName && action.payload.auth){
                state.domainName = action.payload.domainName;
                state.auth = action.payload.auth;
            }
            else{
                state.domainName = null
                state.auth = null
            }
        }
    }
})

export default DomainSlice;

export const {changeDomain} = DomainSlice.actions