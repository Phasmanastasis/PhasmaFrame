import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = (__ENV.BASE_URL || 'http://localhost:8787').replace(/\/$/, '');
const mode = __ENV.PROFILE || 'smoke';

export const options = mode === 'load'
  ? {
      scenarios: {
        api_read: {
          executor: 'constant-vus',
          vus: 5,
          duration: '30s',
        },
      },
      thresholds: {
        checks: ['rate==1'],
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<500'],
      },
    }
  : {
      scenarios: {
        api_smoke: {
          executor: 'per-vu-iterations',
          vus: 1,
          iterations: 1,
        },
      },
      thresholds: {
        checks: ['rate==1'],
      },
    };

export default function () {
  const health = http.get(`${baseUrl}/api/health`, { tags: { endpoint: 'health' } });
  check(health, {
    'health responds with 200': (response) => response.status === 200,
    'health reports API ready': (response) => {
      try {
        const body = response.json();
        return body.status === 'ok' && body.service === 'api';
      } catch {
        return false;
      }
    },
  });

  const examples = http.get(`${baseUrl}/api/examples`, { tags: { endpoint: 'examples' } });
  check(examples, {
    'examples responds with 200': (response) => response.status === 200,
    'examples returns a JSON list': (response) => {
      try {
        return Array.isArray(response.json());
      } catch {
        return false;
      }
    },
  });

  if (mode === 'load') sleep(1);
}
