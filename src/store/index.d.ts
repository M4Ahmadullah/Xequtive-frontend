import { TypedUseSelectorHook } from "react-redux";

// Define a generic state type
type GenericState = Record<string, unknown>;

export declare const store: import("@reduxjs/toolkit").EnhancedStore<GenericState, import("redux").UnknownAction, import("@reduxjs/toolkit").Tuple<[import("redux").StoreEnhancer<{
    dispatch: import("redux-thunk").ThunkDispatch<GenericState, undefined, import("redux").UnknownAction>;
}>, import("redux").StoreEnhancer]>>;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export declare const useAppDispatch: () => import("redux-thunk").ThunkDispatch<GenericState, undefined, import("redux").UnknownAction> & import("redux").Dispatch<import("redux").UnknownAction>;

export declare const useAppSelector: TypedUseSelectorHook<RootState>;
