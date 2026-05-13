import { createContext, useContext } from "react";

export const PreloadContext = createContext<{ ready: boolean }>({ ready: false });
export const usePreload = () => useContext(PreloadContext);
