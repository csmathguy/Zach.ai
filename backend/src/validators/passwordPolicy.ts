const DENYLIST = ['password', '123456', 'qwerty'];

const hasAtLeastThreeClasses = (value: string): boolean => {
  const classes = [
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /[0-9]/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ];

  return classes.filter(Boolean).length >= 3;
};

export const passwordPolicy = {
  minLength: 12,
  denylist: DENYLIST,
  hasRequiredClasses: hasAtLeastThreeClasses,
};
