import { describe, it, expect, vi, beforeEach } from 'vitest';

// Capture toast calls before importing the client (its interceptor imports toast).
const toastErrorMock = vi.fn();
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: (...a: unknown[]) => toastErrorMock(...a) },
}));

import { apiClient, ApiRequestError } from '@/api/client';
import { parseLinkHeader } from '@/api/todos';

beforeEach(() => {
  toastErrorMock.mockReset();
});

describe('apiClient error interceptor', () => {
  it('surfaces a 429 with a friendly toast and an ApiRequestError carrying the status', async () => {
    // A custom adapter lets us simulate a 429 response without a network call.
    apiClient.defaults.adapter = async (config) => {
      const error = Object.assign(new Error('Request failed'), {
        isAxiosError: true,
        config,
        response: {
          status: 429,
          data: { success: false, error: { message: 'Too many requests. Please slow down.' } },
          headers: {},
          config,
          statusText: 'Too Many Requests',
        },
      });
      throw error;
    };

    await expect(apiClient.get('/todos')).rejects.toMatchObject({ status: 429 });

    expect(toastErrorMock).toHaveBeenCalledWith(
      expect.stringMatching(/too fast/i)
    );
  });

  it('rejects with an ApiRequestError that carries the 409 status (no global toast)', async () => {
    apiClient.defaults.adapter = async (config) => {
      const error = Object.assign(new Error('Request failed'), {
        isAxiosError: true,
        config,
        response: {
          status: 409,
          data: { success: false, error: { message: 'The record was modified' } },
          headers: {},
          config,
          statusText: 'Conflict',
        },
      });
      throw error;
    };

    const rejection = await apiClient.patch('/todos/1', {}).catch((e) => e);
    expect(rejection).toBeInstanceOf(ApiRequestError);
    expect(rejection.status).toBe(409);
    expect(rejection.message).toBe('The record was modified');
    // 409 is handled by the caller, not globally toasted here.
    expect(toastErrorMock).not.toHaveBeenCalled();
  });
});

describe('parseLinkHeader (RFC 5988)', () => {
  it('parses first/prev/next/last relations', () => {
    const header =
      '<http://x/api/todos?offset=0>; rel="first", ' +
      '<http://x/api/todos?offset=40>; rel="last", ' +
      '<http://x/api/todos?offset=0>; rel="prev", ' +
      '<http://x/api/todos?offset=40>; rel="next"';
    const links = parseLinkHeader(header);
    expect(links.first).toBe('http://x/api/todos?offset=0');
    expect(links.last).toBe('http://x/api/todos?offset=40');
    expect(links.next).toBe('http://x/api/todos?offset=40');
    expect(links.prev).toBe('http://x/api/todos?offset=0');
  });

  it('returns an empty object for an absent header', () => {
    expect(parseLinkHeader(undefined)).toEqual({});
  });
});
