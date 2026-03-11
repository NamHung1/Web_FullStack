import { Input } from "antd"

import { useState } from "react"

import styles from "./SearchBar.module.css"

interface Props {

  onSearch: (value: string) => void

}

export default function SearchBar({ onSearch }: Props) {

  const [value, setValue] = useState("")

  return (

    <div className={styles.search}>

      <Input.Search

        placeholder="Search product..."

        value={value}

        onChange={(e) => setValue(e.target.value)}

        onSearch={() => onSearch(value)}

      />

    </div>

  )
}