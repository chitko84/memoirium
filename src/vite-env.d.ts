/// <reference types="vite/client" />

declare module "react-responsive-masonry" {
  import type { CSSProperties, ReactNode } from "react";

  export interface MasonryProps {
    children?: ReactNode;
    columnsCount?: number;
    gutter?: string;
    className?: string;
    style?: CSSProperties;
  }

  export default function Masonry(props: MasonryProps): JSX.Element;
}
