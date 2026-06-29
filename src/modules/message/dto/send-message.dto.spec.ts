import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SendButtonMessageDto, SendMediaMessageDto, SendTextMessageDto } from './send-message.dto';

const validateDto = (cls: new () => object, obj: unknown) =>
  validate(plainToInstance(cls, obj), { whitelist: true, forbidNonWhitelisted: true });

describe('SendTextMessageDto mentions', () => {
  it('accepts an optional array of mention WIDs', async () => {
    const errors = await validateDto(SendTextMessageDto, {
      chatId: 'g@g.us',
      text: 'hi @62811',
      mentions: ['62811@c.us'],
    });
    expect(errors).toHaveLength(0);
  });

  it('is omittable', async () => {
    await expect(validateDto(SendTextMessageDto, { chatId: 'g@g.us', text: 'hi' })).resolves.toHaveLength(0);
  });

  it('rejects a non-string mention', async () => {
    const errors = await validateDto(SendTextMessageDto, {
      chatId: 'g@g.us',
      text: 'hi',
      mentions: [123],
    });
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('SendMediaMessageDto mentions', () => {
  it('accepts an optional array of mention WIDs', async () => {
    const errors = await validateDto(SendMediaMessageDto, {
      chatId: 'g@g.us',
      url: 'https://example.com/a.jpg',
      caption: 'look @62811',
      mentions: ['62811@c.us'],
    });
    expect(errors).toHaveLength(0);
  });
});

describe('SendButtonMessageDto', () => {
  const validateButtons = (obj: object) => validateDto(SendButtonMessageDto, obj);

  it('accepts a valid button message payload', async () => {
    const errors = await validateButtons({
      chatId: '917069567007@c.us',
      text: 'Neha wants to connect with you',
      footer: 'ContactBook',
      buttons: [
        { id: 'accept', title: 'Accept' },
        { id: 'decline', title: 'Decline' },
      ],
    });
    expect(errors).toHaveLength(0);
  });

  it('requires one to three buttons', async () => {
    await expect(
      validateButtons({ chatId: '917069567007@c.us', text: 'Invite', buttons: [] }),
    ).resolves.not.toHaveLength(0);
    await expect(
      validateButtons({
        chatId: '917069567007@c.us',
        text: 'Invite',
        buttons: [
          { id: 'one', title: 'One' },
          { id: 'two', title: 'Two' },
          { id: 'three', title: 'Three' },
          { id: 'four', title: 'Four' },
        ],
      }),
    ).resolves.not.toHaveLength(0);
  });

  it('rejects unknown fields on buttons', async () => {
    const errors = await validateButtons({
      chatId: '917069567007@c.us',
      text: 'Invite',
      buttons: [{ id: 'accept', title: 'Accept', url: 'https://example.com' }],
    });
    expect(errors).not.toHaveLength(0);
  });
});
