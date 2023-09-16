import { configureStore } from "@reduxjs/toolkit";
import DomainSlice from "./domainReducer";

const reducers = {
    domain: DomainSlice.reducer
}

const Store = configureStore({
    reducer: reducers
})

export default Store;
export type RootState = ReturnType<typeof Store.getState>