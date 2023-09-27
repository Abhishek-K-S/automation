import { createSelector } from "reselect";
import { RootState } from "../store/store"

let authSelector = (state: RootState)=>state.domain.auth;
let domainSelector = (state: RootState)=>state.domain.domainName;

export const getAuthSelector = createSelector([authSelector, domainSelector], (val1, val2)=>{
    return {auth: val1, domain: val2}
})