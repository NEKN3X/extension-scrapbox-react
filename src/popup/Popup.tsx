import {
  Container,
  Button,
  Checkbox,
  Group,
  TextInput,
  Select,
  Title,
  Flex,
  Box,
  Loader,
  Center,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { getBucket } from '@extend-chrome/storage';

type MyBucket = {
  targetProject: string | null;
  body: string | null;
};
const bucket = getBucket<MyBucket>('my_bucket', 'sync');
const saveProject = (value: string | null) => {
  bucket.set({ targetProject: value });
};
const saveBody = (value: string | null) => {
  bucket.set({ body: value });
};

type ProjectsResponse = {
  projects: {
    id: string;
    name: string; // $projectnameと同じ
    displayName: string;
    publicVisible: boolean; // 公開projectならtrue
    loginStrategies: string[]; // 常に空？
    theme: string;
    plan?: string | null;
    gyazoTeamsName: string | null;
    googleAnalyticsCode: string | null;
    created: number;
    updated: number;
    isMember: boolean;
    trialing: boolean;
  }[];
};

const Popup = () => {
  document.body.style.width = '20rem';
  const [projects, setProjects] = useState(null as string[] | null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [defaultProject, setDefaultProject] = useState('');
  const [defaultBody, setDefaultBody] = useState('');

  useEffect(() => {
    fetch('https://scrapbox.io/api/projects')
      .then((res) => res.json())
      .then((data: ProjectsResponse) => {
        setProjects(data.projects.map((project) => project.name));
      });

    (async () => {
      const value = await bucket.get();
      if (value.targetProject) {
        setDefaultProject(value.targetProject);
      }
      if (value.body) {
        setDefaultBody(value.body);
      }
    })();

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab.url) {
        setUrl(currentTab.url);
      }
      if (currentTab.title) {
        setTitle(currentTab.title);
      }
    });
  }, []);

  return (
    <Container p="sm">
      <Container pb="sm">
        <Title order={4}>Save to Cosense</Title>
      </Container>
      <Container>
        {projects ? (
          <Form
            projects={projects}
            defaultProject={defaultProject}
            defaultBody={defaultBody}
            url={url}
            title={title}
          />
        ) : (
          <Center>
            <Loader />
          </Center>
        )}
      </Container>
    </Container>
  );
};

const Form = ({
  projects,
  defaultProject,
  defaultBody,
  url,
  title,
}: {
  projects: string[];
  defaultProject: string;
  defaultBody: string;
  url: string;
  title: string;
}) => {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      project: defaultProject,
      save_target_project: false,
      page_title: title,
      link_title: title,
      body: defaultBody,
      save_body: false,
    },
    validate: {
      project: (value) => (value.trim().length > 0 ? null : 'Project is required'),
      page_title: (value) => (value.trim().length > 0 ? null : 'Page Title is required'),
      link_title: (value) => (value.trim().length > 0 ? null : 'Link title is required'),
    },
  });

  return (
    <>
      <form
        onSubmit={form.onSubmit((values) => {
          window.open(
            `https://scrapbox.io/${values.project}/${encodeURIComponent(
              values.page_title
            )}?body=${encodeURIComponent(
              [`[${url} ${values.link_title}]`, '', values.body].join('\n')
            )}`
          );
          if (values.save_target_project) {
            saveProject(values.project);
          }
          if (values.save_body) {
            saveBody(values.body);
          }
        })}
      >
        <Flex gap={'sm'} direction={'column'}>
          {projects.length > 0 && (
            <Box>
              <Select
                label="Project"
                data={projects}
                allowDeselect={false}
                key={form.key('project')}
                searchable
                {...form.getInputProps('project')}
              />
              <Checkbox
                mt={'xs'}
                label="Save as default"
                key={form.key('save_target_project')}
                {...form.getInputProps('save_target_project', { type: 'checkbox' })}
              />
            </Box>
          )}
          <TextInput
            label="Page Title"
            key={form.key('page_title')}
            {...form.getInputProps('page_title')}
          />
          <TextInput
            label="Link Title"
            key={form.key('link_title')}
            {...form.getInputProps('link_title')}
          />
          <Box>
            <TextInput label="Body" key={form.key('body')} {...form.getInputProps('body')} />
            <Checkbox
              mt={'xs'}
              label="Save as default"
              key={form.key('save_body')}
              {...form.getInputProps('save_body', { type: 'checkbox' })}
            />
          </Box>
          <Group justify="flex-end" mt="md">
            <Button type="submit">Submit</Button>
          </Group>
        </Flex>
      </form>
    </>
  );
};

export default Popup;
