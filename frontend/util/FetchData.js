export function FetchDataAuthJson(url, credentials) {
  return fetch(url, { 
    method: 'GET', 
    headers: new Headers({
      'Authorization': `Bearer ${credentials.password}`,
    }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }

    return response.json();
  })
}

export function FetchDataAuth(url, credentials) {
  return fetch(url, { 
    method: 'GET', 
    headers: new Headers({
      'Authorization': `Bearer ${credentials.password}`,
    }),
  })
}

export function PostDataAuthJson(url, credentials, data) {
  return fetch(url, { 
    method: 'POST', 
    headers: new Headers({
      'Authorization': `Bearer ${credentials.password}`,
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(data)
  }).then((response) => {
    console.log(response);

    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }

    return response.json();
  })
}
