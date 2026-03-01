import type { ReactNode } from "react";

export type LoadingStateProps = {
  message?: string;
  className?: string;
};

export type ErrorStateProps = {
  message: string;
  className?: string;
};

export type EmptyStateProps = {
  message: string;
  className?: string;
  action?: ReactNode;
};

export type ImagePlaceholderProps = {
  className?: string;
  textClassName?: string;
  text?: string;
};
