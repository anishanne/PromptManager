export default function Error({ message }: { message?: string }) {
	return <p className="mt-2 w-full text-center text-red-500">{message}</p>;
}
