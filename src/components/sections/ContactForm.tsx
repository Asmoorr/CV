"use client";

import { useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { CONTACT_FIELD_LIMITS, type ContactContent } from "@/content/schema";
import { ArrowUpRight } from "../ui/ArrowUpRight";
import styles from "./ContactForm.module.css";

type Field = "name" | "email" | "message";
type Values = Record<Field, string>;
type ErrorKind = "required" | "invalidEmail" | "tooLong";
type Errors = Partial<Record<Field, ErrorKind>>;
type StatusKind = "success" | "rateLimit" | "unavailable" | "validation" | "delivery";

const EMPTY_VALUES: Values = { name: "", email: "", message: "" };

function codePointLength(value: string) {
  return Array.from(value).length;
}

export function ContactForm({ content }: { content: ContactContent["form"] }) {
  const id = useId().replaceAll(":", "");
  const [values, setValues] = useState<Values>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Errors>({});
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<StatusKind | "">("");
  const fieldRefs = useRef<Record<Field, HTMLInputElement | HTMLTextAreaElement | null>>({
    name: null,
    email: null,
    message: null,
  });
  const sendingRef = useRef(false);

  const errorCopy: Record<ErrorKind, string> = {
    required: content.requiredError,
    invalidEmail: content.invalidEmailError,
    tooLong: content.tooLongError,
  };
  const statusCopy: Record<StatusKind, string> = {
    success: content.successMessage,
    rateLimit: content.rateLimitError,
    unavailable: content.unavailableError,
    validation: content.validationFailed,
    delivery: content.deliveryError,
  };

  const validate = (current: Values): Errors => {
    const next: Errors = {};
    if (!current.name.trim()) next.name = "required";
    else if (codePointLength(current.name) > CONTACT_FIELD_LIMITS.name) next.name = "tooLong";

    if (!current.email.trim()) next.email = "required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(current.email.trim())) next.email = "invalidEmail";
    else if (codePointLength(current.email) > CONTACT_FIELD_LIMITS.email) next.email = "tooLong";

    if (!current.message.trim()) next.message = "required";
    else if (codePointLength(current.message) > CONTACT_FIELD_LIMITS.message) next.message = "tooLong";
    return next;
  };

  const updateField = (field: Field, event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...values, [field]: event.currentTarget.value };
    setValues(next);
    setStatus("");
    if (errors[field]) setErrors(validate(next));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sendingRef.current) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setStatus("");
    const firstInvalid = (Object.keys(EMPTY_VALUES) as Field[]).find((field) => nextErrors[field]);
    if (firstInvalid) {
      fieldRefs.current[firstInvalid]?.focus();
      return;
    }

    sendingRef.current = true;
    setIsSending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: values.name.trim(), email: values.email.trim(), message: values.message.trim() }),
      });
      const payload = await response.json().catch(() => null) as { ok?: boolean } | null;

      if (response.status === 200 && payload?.ok === true) {
        setValues(EMPTY_VALUES);
        setErrors({});
        setStatus("success");
      } else if (response.status === 429) {
        setStatus("rateLimit");
      } else if (response.status === 503) {
        setStatus("unavailable");
      } else if (response.status === 400) {
        setStatus("validation");
      } else {
        setStatus("delivery");
      }
    } catch {
      setStatus("delivery");
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  };

  const describedBy = (field: Field) => errors[field] ? `${id}-${field}-error` : undefined;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate aria-busy={isSending} data-contact-reveal>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor={`${id}-name`}>{content.nameLabel}</label>
          <input
            ref={(element) => { fieldRefs.current.name = element; }}
            id={`${id}-name`}
            name="name"
            type="text"
            autoComplete="name"
            placeholder={content.namePlaceholder}
            maxLength={CONTACT_FIELD_LIMITS.name * 2}
            required
            value={values.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy("name")}
            onChange={(event) => updateField("name", event)}
          />
          <span className={styles.error} id={`${id}-name-error`}>{errors.name ? errorCopy[errors.name] : ""}</span>
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-email`}>{content.emailLabel}</label>
          <input
            ref={(element) => { fieldRefs.current.email = element; }}
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={content.emailPlaceholder}
            maxLength={CONTACT_FIELD_LIMITS.email * 2}
            required
            value={values.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("email")}
            onChange={(event) => updateField("email", event)}
          />
          <span className={styles.error} id={`${id}-email-error`}>{errors.email ? errorCopy[errors.email] : ""}</span>
        </div>
      </div>
      <div className={`${styles.field} ${styles.messageField}`}>
        <label htmlFor={`${id}-message`}>{content.messageLabel}</label>
        <textarea
          ref={(element) => { fieldRefs.current.message = element; }}
          id={`${id}-message`}
          name="message"
          placeholder={content.messagePlaceholder}
          maxLength={CONTACT_FIELD_LIMITS.message * 2}
          required
          value={values.message}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy("message")}
          onChange={(event) => updateField("message", event)}
        />
        <span className={styles.error} id={`${id}-message-error`}>{errors.message ? errorCopy[errors.message] : ""}</span>
      </div>
      <div className={styles.actions}>
        <p className={styles.status} role="status" aria-live="polite">{status ? statusCopy[status] : ""}</p>
        <button type="submit" disabled={isSending}>
          <span>{isSending ? content.sendingLabel : content.submitLabel}</span>
          <i aria-hidden="true"><ArrowUpRight /></i>
        </button>
      </div>
    </form>
  );
}
