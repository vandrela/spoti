import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css';

function App() {
  const CLIENT_ID = '8b4d2d10943048d69784c5251f42cac6'
  const REDIRECT_URI = 'http://localhost:3000'
  const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize'
  const RESPONSE_TYPE = 'token'

  const [token, setToken] = useState('')
  const [tracks, setTracks] = useState([])
  const [artistFilter, setArtistFilter] = useState(window.localStorage.getItem('artist') || '')


  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem('token')

    if(!token && hash) {
      token = hash.substring(1).split('&').find(el => el.startsWith('access_token')).split('=')[1]

      window.location.hash = ''
      window.localStorage.setItem('token', token)
    }

    if(artistFilter) {
      window.localStorage.setItem('artist', artistFilter);
    }

    setToken(token)
  }, [artistFilter])

  const getRecentPlayed = async(e) => {
    console.log(token, 'token')
    e.preventDefault()
    const { data } = await axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=10', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    console.log(token, 'token')
    setTracks(data.items)
  }

  const logout = () => {
    setToken('')
    window.localStorage.removeItem('token')
  }

  const renderRecentPlayedTracksFiltered = () => {
    return tracks.map(track => (
      <div style={{ display: "flex", flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} key={track.track.id}>
        {track.track.album.images.length && track.track.artists[0].name === artistFilter ? <img width='50%' src={track.track.album.images[0].url} alt={track.track.name}/> : null}
        {track.track.name && track.track.artists[0].name === artistFilter ? track.track.name : null}
      </div>
    ))
  }

  const renderRecentPlayedTracks = () => {
    return tracks.map(track => (
        <div style={{ display: "flex", flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} key={track.track.id}>
          {track.track.album.images.length ? <img width='50%' src={track.track.album.images[0].url} alt={track.track.name}/> : null}
          {track.track.name ? track.track.name : null}
        </div>
    ))
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify React</h1>
        {!token ?
          <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=user-read-recently-played`}>Login to spotify</a>
          : <button onClick={logout}>Logout</button>
        }
        {token &&  <button onClick={getRecentPlayed}>Show Recent Played track</button>}
        {token && artistFilter ?
         renderRecentPlayedTracksFiltered() :
            token && !artistFilter ?
                renderRecentPlayedTracks()
                :<h2>Please login!</h2>
        }
      </header>
      <aside className="App-aside">
        {token && tracks.map(track => (
            <div
                style={{ height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                key={track.track.id}
                onClick={() => setArtistFilter(track.track.artists[0].name)}
            >
              {track.track.artists[0].name}
            </div>
        ))}
      </aside>
    </div>
  );
}

export default App;
