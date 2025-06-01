import { action, computed, observable } from "mobx";
import { exists } from "src/utils/exists";
export type ValidateFormOptions = {
  stopOnFirstError?: boolean;
  focusOnFirstError?: boolean;
  silent?: boolean;
};

export type Validator = FormField<any, any> | (() => boolean);
export const validateAll = (
  fields: (Validator | undefined | false)[],
  options: ValidateFormOptions = {},
) => {
  let isValid = true;
  let hadFirstError = false;
  const validators = fields.filter(exists);

  for (const validator of validators) {
    const isField = typeof validator !== "function";
    let validationResult: boolean;
    if (isField) {
      const errorBeforeValidation = validator.error;
      validationResult = validator.validate();
      if (options.silent) {
        validator.setError(errorBeforeValidation);
      }
    } else {
      validationResult = validator();
    }

    if (!validationResult) {
      isValid = false;
      if (isField && options.focusOnFirstError && !hadFirstError) {
        hadFirstError = true;
        validator.focus();
      }
      if (options.stopOnFirstError) {
        break;
      }
    }
  }

  return isValid;
};
export default function formField<T, U extends HTMLElement = HTMLElement>(
  value: T,
  options: FormFieldOptions<T> = {},
) {
  const { validator, autoValidate, setMiddleware, onChanged } = options;
  let _validator;
  if (Array.isArray(validator)) {
    const validators = validator;
    _validator = (v: T) => {
      for (const f of validators) {
        const err = f(v);
        if (err != null) {
          return err;
        }
      }
      return null;
    };
  } else {
    _validator = validator ?? (() => null);
  }
  return new FormField<T, U>(
    value,
    _validator,
    autoValidate,
    setMiddleware,
    onChanged ?? (() => {}),
  );
}

export class FormField<T, U extends HTMLElement> {
  @observable private accessor _value: T;
  @observable private accessor _error: string | null = null;

  constructor(
    value: T,
    private validator: (v: T) => string | null | undefined = () => null,
    private autoValidate = false,
    private setMiddleware: (v: T) => T = (v) => v,
    private onChanged: (v: T) => void,
  ) {
    this._value = value;
    this.id = generateId();
  }
  private refValue: U | null = null;
  id: string;

  ref = (ref: U | null) => {
    if (ref != null) {
      this.refValue = ref;
    }
  };

  @action.bound
  focus() {
    this.refValue?.focus();
  }

  @action.bound set(v: T) {
    this._value = this.setMiddleware(v);
    if (this.autoValidate) {
      this.validate();
    } else {
      this._error = null;
    }
    this.onChanged(v);
  }

  @action.bound setError(err: string | null) {
    this._error = err;
  }

  @computed get value() {
    return this._value;
  }

  @computed get error() {
    return this._error;
  }

  @action.bound validate() {
    this._error = this.validator(this._value) ?? null;
    return this._error == null;
  }

  get isValid() {
    this.validate();
    return this._error == null;
  }

  getProps = () => {
    return {
      id: this.id,
      value: this.value,
      onChange: this.onChange,
      isError: this.error != null,
      errorText: this.error,
    };
  };

  @action.bound
  private onChange(
    v:
      | T
      | {
          currentTarget: { value: T };
        },
  ) {
    const _v =
      typeof v === "object" && v != null && "currentTarget" in v
        ? v.currentTarget.value
        : v;
    this.set(_v);
  }
}

export interface FormFieldOptions<T> {
  validator?:
    | ((v: T) => string | null | undefined)
    | Array<(v: T) => string | null | undefined>;

  setMiddleware?: (v: T) => T;
  onChanged?: (v: T) => void;
  autoValidate?: boolean;
}

export const validators = {
  required: <T>(v: T) =>
    v == null || (typeof v === "string" && v.trim().length === 0)
      ? "Required"
      : null,
  minLength:
    (min: number) =>
    <T extends string>(v: T) =>
      v.length < min ? `Min length is ${min}` : null,
  maxLength:
    (max: number) =>
    <T extends string>(v: T) =>
      v.length > max ? `Max length is ${max}` : null,
  email: <T extends string>(v: T) => {
    let re = new RegExp(/^[^@]*[^.@]+@[^.@]+([^@]*[^.@]+)?\.\w+$/);
    return re.exec(v) == null ? "Invalid email" : null;
  },
  min:
    (
      min: number,
      opts: { errorText?: string | ((v: number) => string) } = {},
    ) =>
    (v: number) => {
      if (v >= min) return null;
      if (opts.errorText != null)
        return typeof opts.errorText === "string"
          ? opts.errorText
          : opts.errorText(v);
      return `Min value is ${min}`;
    },
  max:
    (
      max: number,
      opts: { errorText?: string | ((v: number) => string) } = {},
    ) =>
    (v: number) => {
      if (v <= max) return null;
      if (opts.errorText != null)
        return typeof opts.errorText === "string"
          ? opts.errorText
          : opts.errorText(v);
      return `Max value is ${max}`;
    },
  minMax: (min: number, max: number) => (v: number) => {
    if (v < min || v > max) {
      return `Value should be between ${min} and ${max}`;
    }
    return null;
  },
};

export function mapOptional<T, U>(fn: (v: T) => U) {
  return (v: T | undefined | null) => (v == null ? undefined : fn(v));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
