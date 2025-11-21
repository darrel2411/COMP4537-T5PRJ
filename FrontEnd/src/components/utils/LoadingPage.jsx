import { Spinner } from "@/components/ui/spinner";

const LoadingPage = () => {

    return(
        <div className="flex flex-col items-center justify-center h-screen text-xl w-full">
            <Spinner />
            <span>loading</span>
        </div>
    );
}

export default LoadingPage;