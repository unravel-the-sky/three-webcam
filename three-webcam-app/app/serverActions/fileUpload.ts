'use server'

import { OrganisationDto, SubmittedFormData } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { getAwsDownloadUrl, getFileUrl, uploadImage, uploadPdf } from "./awsFuncs";

export const submitForm = async (
    formData: FormData,
  ): Promise<any> => {
    const rawFormData = {
      username: formData.get("username"),
      color: formData.get("color"),
      image: formData.get("image"),
    };

    let avatar = null;

    // now upload the image to s3 and get the download url
    const image = rawFormData.image as File;
    const username = rawFormData.username as string;
    const uploadedFileKey = await uploadImage(
      image,
      username,
    );
    if (uploadedFileKey) {
      const url = await getFileUrl(uploadedFileKey); // file name here
      if (url) avatar = url;
    }
  
    // if (organisationId) {
    //   await updateOrganisationById(organisationToCreate, organisationId)
    // } else {
    //   await addOrganisationToDb(organisationToCreate);
    // }
  
    revalidatePath('/')
  
    return rawFormData;
  };

  