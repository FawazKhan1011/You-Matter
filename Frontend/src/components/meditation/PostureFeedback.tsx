"use client";

type Props = {
  message: string;
};

export function PostureFeedback({ message }: Props) {
  return <div className="posture-toast">{message}</div>;
}
