// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import yaml from 'js-yaml'
import axios from 'axios'

type Ros2Repos = {
  repositories: {
    [name: string]: {
      type: 'git',
      url: string,
      version: string,
    }
  }
}

type RepoVersions = {
  [name: string]: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let {distro, ...packages} = req.query
  distro = distro || 'rolling'
  let ros2ReposBranch = distro === 'rolling' ? 'master' : distro
  const reposUrl = `https://raw.githubusercontent.com/ros2/ros2/${ros2ReposBranch}/ros2.repos`

  const { data: reposFileText } = await axios.get(reposUrl)
  const fileYaml = yaml.load(reposFileText as string) as Ros2Repos

  const reposNotFound: string[] = []
  for(const repoVersion of Object.entries(packages as RepoVersions)) {
    const [repoOrgAndName, version] = repoVersion

    let url: string, branch: string
    if (version.match(/:/)) {
      const [org, branchName] = version.split(':')
      const repo = repoOrgAndName.split('/')[1]
      url = `https://github.com/${org}/${repo}.git`
      branch = branchName
    } else {
      url = fileYaml.repositories[repoOrgAndName].url
      branch = version
    }
    if (fileYaml.repositories[repoOrgAndName]) {
      fileYaml.repositories[repoOrgAndName].url = url
      fileYaml.repositories[repoOrgAndName].version = branch
    } else {
      reposNotFound.push(repoOrgAndName)
    }
  }

  if (reposNotFound.length > 0) {
    res.status(404).send(
      JSON.stringify(
        {
          error: `Repositories not found: ${reposNotFound.join(', ')}`,
          reposUrl,
          distro,
        },
        null,
        2,
      ))
  } else {
    const outText = yaml.dump(fileYaml)
    res.status(200).send(outText)
  }
}
