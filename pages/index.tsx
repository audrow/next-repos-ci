import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'


type EntryProps<Index> = {
  index: Index,
  onChange: (index: Index, key: string, value: string) => void
  keyTitle?: string,
  valueTitle?: string,
  keyPlaceholder?: string,
  valuePlaceholder?: string,
}

const Entry = ({index, onChange, keyTitle, valueTitle, keyPlaceholder, valuePlaceholder}: EntryProps<number>) => {
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')

  useEffect(() => {
    onChange(index, key, value)
  }, [key, value, index, onChange])

  return (
    <div>
      {keyTitle && <label htmlFor="key">{keyTitle}</label>}
      <input
        id="key"
        type="text"
        placeholder={keyPlaceholder}
        value={key}
        onChange={e => setKey(e.target.value)}
      />
      {valuePlaceholder && <label htmlFor="value">{valueTitle}</label>}
      <input
        id="value"
        type="text"
        placeholder={valuePlaceholder}
        value={value}
        onChange={e => setValue(e.target.value)}
      />
    </div>
  )
}

type EntryList = {
  [index: number]: {
    key: string,
    value: string
  }
}

const availableDistros = [
  'rolling',
  'humble',
  'galactic',
  'foxy',
]

const Home: NextPage = () => {
  const router = useRouter()

  const [distro, setDistro] = useState<string>(availableDistros[0])
  const [numEntries, setNumEntries] = useState(1)
  const [entries, setEntries] = useState<EntryList>({})

  const handleSubmit = (event: any) => {
    event.preventDefault()
    console.log('submit')
  }

  const handleEntryChange = (index: number, key: string, value: string) => {
    if (entries[index]?.key !== key || entries[index]?.value !== value) {
      setEntries({...entries, [index]: {key, value}})

      console.log(JSON.stringify(entries))
      const keyValues: {[key: string]: string} = {}
      for (const {key, value} of Object.values(entries)) {
        keyValues[key] = value
      }
      router.replace({
        query: keyValues
      })
    }
  }

  useEffect(() => {
    const keyValues: { [key: string]: string } = {}

    keyValues.distro = distro

    for (const { key, value } of Object.values(entries)) {
      if(key && value) {
        keyValues[key] = value
      }
    }
    router.replace({
      query: keyValues
    })
  }, [entries, distro])

  const handleAddEntry = () => {
    setNumEntries(numEntries + 1)
  }

  const handleRemoveEntry = () => {
    const { [numEntries - 1]: _, ...newEntries } = entries
    setEntries(newEntries)
    setNumEntries(numEntries - 1)
  }

  return (
    <>
      <Head>
        <title>Make ROS2 Repos</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <label htmlFor="distro">Distro</label>
        <select value={distro} onChange={e => setDistro(e.target.value)}>
          {availableDistros.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <br/>
        <br/>
        <button onClick={handleAddEntry}>
          Add Entry
        </button>
        <button onClick={handleRemoveEntry}>
          Remove Entry
        </button>
        <br/>
        {
          Array.from(Array(numEntries).keys()).map((index) => (
            <Entry key={index} index={index} keyPlaceholder='org/repo'  valuePlaceholder='org:branch or branch' onChange={handleEntryChange} />
          ))
        }
        <br/>
        <Link href={{
          pathname: '/api/repos-file',
          query: router.query,
        }}>
          <button>
            Submit
          </button>
        </Link>
      </main>
    </>
  )
}

export default Home
