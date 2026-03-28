import React from 'react'
import MainLayout from '../../components/MainLayout/MainLayout'
import { useParams } from 'react-router-dom'
import axiosInstance from '../../shared/api/axiosConfig'
import type { InspectionModel } from '../../shared/api/Models/InspectionModel'
import { useQuery } from '@tanstack/react-query'
import { Card, Container, Placeholder } from 'react-bootstrap'


async function getInspections(userId: string): Promise<InspectionModel> {
    const { data } = await axiosInstance.get(`/inspection/${userId}`)
    return data;

}
const InspectionDetails = () => {
    const { id } = useParams();

    const { data } = useQuery({
        queryKey: ['inspection', id],
        queryFn: () => getInspections(id as string),

    })
    console.log(data);

    return (
        <MainLayout>
            <Container className='mt-5'>
                <div>
                    Амбулаторный осмотр от <Placeholder lg={3} />
                </div>
            </Container>
        </MainLayout>
    )
}

export default InspectionDetails