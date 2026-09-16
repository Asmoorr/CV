"use client";

import { useState, type FormEvent } from "react";
import type { ContactContent } from "@/content/schema";
import styles from "./Contact.module.css";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

export function ContactForm({ content }: { content: ContactContent["form"] }) {
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const next: Errors = {};
    if (!name) next.name = content.requiredError;
    if (!email) next.email = content.requiredError;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = content.emailError;
    if (!message) next.message = content.requiredError;
    else if (message.length > 2000) next.message = content.messageLengthError;
    setErrors(next);
    setNotice(Object.keys(next).length ? "" : content.unavailableMessage);
  };

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.identityFields}>
        <label>
          <span>{content.nameLabel}</span>
          <input name="name" autoComplete="name" placeholder={content.namePlaceholder} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "contact-name-error" : undefined} />
          {errors.name ? <small id="contact-name-error">{errors.name}</small> : null}
        </label>
        <label>
          <span>{content.emailLabel}</span>
          <input name="email" type="email" autoComplete="email" placeholder={content.emailPlaceholder} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "contact-email-error" : undefined} />
          {errors.email ? <small id="contact-email-error">{errors.email}</small> : null}
        </label>
      </div>
      <label className={styles.messageField}>
        <span>{content.messageLabel}</span>
        <textarea name="message" rows={4} maxLength={2001} placeholder={content.messagePlaceholder} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "contact-message-error" : undefined} />
        {errors.message ? <small id="contact-message-error">{errors.message}</small> : null}
      </label>
      <div className={styles.formFooter}>
        <button type="submit">{content.submitLabel}<span aria-hidden="true">↗</span></button>
        <p className={styles.formNotice} role="status" aria-live="polite">{notice}</p>
      </div>
    </form>
  );
}
