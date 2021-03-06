import Image from "next/image";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";

import { format, parseISO } from "date-fns";
import pt from "date-fns/locale/pt";

import api from "../../services/api";

import convertDurationToString from "../../utils/convertDurationToString";

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  publishedAt: string;
  duration: string;
  durationAsString: string;
  description: string;
  url: string;
};

type EpisodeTypes = {
  episode: Episode;
};

import styles from "./episode.module.scss";
import Link from "next/link";

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await api.get("episodes", {
    params: {
      _limit: 2,
      _sort: "published_at",
      _order: "desc",
    },
  });

  const paths = data.map((episode) => {
    return {
      params: { slug: episode.id },
    };
  });

  return {
    paths,
    fallback: "blocking",
  };
};

export default function Episode({ episode }: EpisodeTypes) {
  // const router = useRouter();

  // if (router.isFallback) {
  //   return <p>Carregando...</p>;
  // }

  return (
    <div className={styles.episode}>
      <div className={styles.thumbnailContainer}>
        <Link href='/'>
          <button type='button'>
            <img src='/arrow-left.svg' alt='Voltar' />
          </button>
        </Link>

        <Image
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit='cover'
        />

        <button type='button'>
          <img src='/play.svg' alt='Tocar Episódio' />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />
    </div>
  );
}

export const getStaticProps: GetStaticProps = async (cxt) => {
  const { slug } = cxt.params;

  const { data } = await api.get(`/episodes/${slug}`);

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), "d MMM yy", {
      locale: pt,
    }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,
  };

  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24, // 24 Hours
  };
};
