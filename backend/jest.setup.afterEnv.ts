const shouldShowLogs = process.env.JEST_SHOW_LOGS === 'true';

if (!shouldShowLogs) {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });
}
