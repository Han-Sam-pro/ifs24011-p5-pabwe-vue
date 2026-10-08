import { apiRequest } from '@/helpers/apiHelper';

export function getAucationsApi({ isMe, isClosed } = {}) {
  return apiRequest('/aucations', {
    query: {
      is_me: isMe ? 1 : undefined,
      is_closed: isClosed === undefined || isClosed === null ? undefined : isClosed ? 1 : 0,
    },
  });
}

export function getAucationDetailApi(id) {
  return apiRequest(`/aucations/${id}`);
}

export function addAucationApi({ title, description, startBid, closedAt }) {
  return apiRequest('/aucations', {
    method: 'POST',
    body: { title, description, start_bid: startBid, closed_at: closedAt },
  });
}

export function updateAucationApi(id, { title, description, startBid, closedAt }) {
  return apiRequest(`/aucations/${id}`, {
    method: 'PUT',
    body: { title, description, start_bid: startBid, closed_at: closedAt },
  });
}

export function changeCoverApi(id, file) {
  const form = new FormData();
  form.append('cover', file);
  return apiRequest(`/aucations/${id}/cover`, { method: 'POST', body: form, isForm: true });
}

export function deleteAucationApi(id) {
  return apiRequest(`/aucations/${id}`, { method: 'DELETE' });
}

export function addBidApi(id, bid) {
  return apiRequest(`/aucations/${id}/bids`, { method: 'POST', body: { bid } });
}

export function deleteBidApi(id) {
  return apiRequest(`/aucations/${id}/bids`, { method: 'DELETE' });
}

export function deleteAllAucationsApi() {
  return apiRequest('/aucations', { method: 'DELETE' });
}
