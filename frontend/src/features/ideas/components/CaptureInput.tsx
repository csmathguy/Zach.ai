import type { FormEvent, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import styles from './CaptureInput.module.css';

interface CaptureInputProps {
  onSubmit: (text: string) => Promise<void>;
}

const SUCCESS_MESSAGE = 'Thought captured!';
const ERROR_MESSAGE = 'Failed to capture thought. Please try again.';
const VALIDATION_MESSAGE = 'Thought cannot be empty.';
const MAX_LENGTH = 10000;
const WARNING_THRESHOLD = 9000;

export const CaptureInput = ({ onSubmit }: CaptureInputProps): JSX.Element => {
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!success) {
      return;
    }
    textareaRef.current?.focus();
    const timeout = window.setTimeout(() => {
      setSuccess(false);
    }, 3000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [success]);

  const validate = (text: string): boolean => {
    if (text.trim().length === 0) {
      setError(VALIDATION_MESSAGE);
      return false;
    }
    if (text.length > MAX_LENGTH) {
      setError(`Thought must be ${MAX_LENGTH} characters or fewer.`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (submitting) {
      return;
    }

    if (!validate(value)) {
      setSuccess(false);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(value.trim());
      setValue('');
      setSuccess(true);
    } catch {
      setSuccess(false);
      setError(ERROR_MESSAGE);
    } finally {
      setSubmitting(false);
      textareaRef.current?.focus();
    }
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    await handleSubmit();
  };

  const handleKeyDown = async (event: KeyboardEvent<HTMLTextAreaElement>): Promise<void> => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await handleSubmit();
    }
  };

  const remaining = MAX_LENGTH - value.length;
  const showCount = remaining <= WARNING_THRESHOLD;

  return (
    <form className={styles.form} onSubmit={handleFormSubmit} aria-label="Capture a new idea">
      <label className={styles.label} htmlFor="idea-input">
        Enter your thought
      </label>
      <textarea
        id="idea-input"
        ref={textareaRef}
        className={styles.input}
        placeholder="What's on your mind?"
        rows={3}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={submitting}
      />
      {showCount ? (
        <div className={styles.counter} aria-live="polite">
          {remaining} characters remaining
        </div>
      ) : null}
      <div className={styles.actions}>
        <button className={styles.submit} type="submit" disabled={value.length === 0 || submitting}>
          {submitting ? 'Capturing...' : 'Capture'}
        </button>
        {success ? (
          <span className={styles.success} role="status" aria-live="polite">
            {SUCCESS_MESSAGE}
          </span>
        ) : null}
        {error ? (
          <span className={styles.error} role="alert" aria-live="assertive">
            {error}
          </span>
        ) : null}
      </div>
    </form>
  );
};
