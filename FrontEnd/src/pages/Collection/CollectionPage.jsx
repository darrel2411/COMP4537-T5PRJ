import BirdDisplay from '../../components/Collection/BirdDisplay';
import Navbar from "@/components/Navbar/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BirdCard from '@/components/Collection/BirdCard';
import { useState, useEffect } from 'react';
import LoadingPage from '@/components/utils/LoadingPage';
import { useUser } from "@/context/UserContext";


const CollectionPage = () => {
    const { user } = useUser();
    const [groupedBirds, setGroupedBirds] = useState({});
    const [birdTypes, setBirdTypes] = useState([]);
    const [collection, setCollection] = useState({});
    const [show, setShow] = useState(false)
    const API_BASE = import.meta.env.VITE_API_BASE;

    useEffect(() => {
        const retrieveBirds = async () => {
            try {
                const response = await fetch(`${API_BASE}/get-birds?userId=${user.userId}`);

                const data = await response.json();

                if (data.ok) {
                    console.log(data);
                    setBirdTypes(data.birdTypes);
                    setGroupedBirds(data.groupedBirds)
                    setCollection(data.collections);
                }

            } catch (err) {
                console.log("Error retrieving birds")
            }
        }

        retrieveBirds();
    }, []);

    if (!birdTypes.length) return <LoadingPage />;

    return (
        <div className=" min-h-screen bg-gray-50">
            <Navbar />
            {show && (
                <div>
                    <div className='flex flex-col p-5 space-y-4'>
                        <BirdDisplay />
                    </div>
                    <hr className="m-auto w-[95%]" />
                </div>

            )}
            <div className='mt-4 place-items-center justified-center text-center '>
                <Tabs defaultValue={(birdTypes[0]?.rare_type)} className="">
                    <TabsList className="">
                        {
                            birdTypes.map((element, index) => (
                                <TabsTrigger key={index} value={(element.rare_type)}>{element.rare_type}</TabsTrigger>
                            ))
                        }
                    </TabsList>
                    {birdTypes.map((type) => (
                        <TabsContent
                            key={type.rare_type_id}
                            value={type.rare_type}
                            className="flex flex-wrap justify-center gap-4 p-4"
                        >
                            {groupedBirds[type.rare_type_id].map((bird) => (
                                <BirdCard key={bird.bird_id} bird={bird} imgUrl={collection[bird.bird_id]} />
                            ))}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}

export default CollectionPage;