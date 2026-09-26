"use client";

import { useState } from "react";
import { ENTRY_SESSION_KEY } from "@/lib/site-entry";
import styles from "./ResetEntrySession.module.css";

export function ResetEntrySession({ label, success, error }: { label: string; success: string; error: string }) {
  const [message, setMessage] = useState("");

  const reset = () => {
    try {
      window.sessionStorage.removeItem(ENTRY_SESSION_KEY);
      setMessage(success);
    } catch {
      setMessage(error);
    }
  };

  return (
    <span className={styles.wrap}>
      <button className={styles.button} type="button" aria-label={label} title={label} onClick={reset}>
        <span aria-hidden="true">↺</span>
      </button>
      <span className={styles.message} aria-live="polite" role="status">{message}</span>
    </span>
  );
}
