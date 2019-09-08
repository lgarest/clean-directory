const fs = require('fs')
const log = console.log.bind(this)


class FilesProcessor {
  constructor(){
    this.path = ''
    this.ignoredFiles = [
      '.DS_Store',
      '.localized',
    ]
    this.replaceRules = [
      [/ebook/gi, ''], // Remove trailing spaces
      [/book/gi, ''], // Remove trailing spaces
      [/_/gi, ' '],   // Remove underscores
      [/-/gi, ' '],   // Remove dashes
      [/\s+/gi, ' '], // Remove trailing spaces
      [/\s+\./gi, '.'], // Remove trailing spaces
    ]
    this.start()
  }

  start = () =>
    this.processDirectory(process.argv[2])

  processDirectory = (directory='.') => {
    this.path = directory;
    fs.readdir(directory, {withFileTypes:true}, (error, files) => {
      if(error) {
        this.processError(error)
      } else {
        this.files = files.filter(f => !this.ignoredFiles.includes(f) && f.isFile())
        log(`Scanning '${directory}'`)
        this.processFiles()
      }
    })
  }

  processFiles = () => {
    this.files.length <= 10
      ? log(`  Found ${this.files.length} files: ${this.files.map(f => f.name)}`)
      : log(`  Found ${this.files.length} files.`)
    this.files.forEach(f => this.processFile(f.name))
  }

  processFile = (fileName) => {
    let newFileName = this.replaceRules.reduce(
      (name, [bad, good]) => name.replace(bad, good),
      fileName,
    )
    const dotSplit = newFileName.split('.')
    const extension = dotSplit.length > 1
      ? dotSplit[dotSplit.length - 1]
      : ''
    const formattedName = dotSplit.slice(0, dotSplit.length - 1).join(' ')
    newFileName = `${formattedName}.${extension}`.toLowerCase()
    this.renameFile(fileName, newFileName)
  }

  renameFile(oldName, newName) {
    fs.rename(`${this.path}/${oldName}`, `${this.path}/${newName}`, (err) => {
      if (err) throw err
      log(`'${oldName}' renamed to '${newName}'`)
    })
  }

  processError(e) {
    log(e)
  }
}

// main
new FilesProcessor()