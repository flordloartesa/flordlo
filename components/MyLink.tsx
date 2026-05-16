import Link from 'next/link';

export default function MyLink(props: any) {
  return (
    <Link {...props} prefetch={false}>
      {props.children}
    </Link>
  );
}