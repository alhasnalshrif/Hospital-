import { Request, Response } from 'express';
import { db, medicalImages, imagingStudies } from '../db';
import { eq } from 'drizzle-orm';

// Medical Imaging System Controller (Internal PACS)

export const uploadMedicalImage = async (req: Request, res: Response) => {
  try {
    const { patientId, imageType, studyDate, bodyPart, description, imageUrl, metadata } = req.body;

    const dicomId = `DICOM_${Date.now()}_${patientId}`;
    
    const newImage = await db.insert(medicalImages).values({
      patientId,
      dicomId,
      imageType,
      studyDate: new Date(studyDate),
      bodyPart,
      description,
      imageUrl,
      thumbnailUrl: `${imageUrl}_thumb`,
      fileSize: metadata?.fileSize || 0,
      metadata,
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Medical image uploaded successfully',
      data: {
        id: newImage[0].id,
        dicomId: newImage[0].dicomId,
        imageUrl: newImage[0].imageUrl,
        thumbnailUrl: newImage[0].thumbnailUrl,
      },
    });
  } catch (error) {
    console.error('Upload medical image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload medical image',
    });
  }
};

export const getMedicalImage = async (req: Request, res: Response) => {
  try {
    const { dicomId } = req.params;

    const image = await db
      .select()
      .from(medicalImages)
      .where(eq(medicalImages.dicomId, dicomId))
      .limit(1);

    if (image.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Medical image not found',
      });
    }

    res.json({
      success: true,
      data: image[0],
    });
  } catch (error) {
    console.error('Get medical image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve medical image',
    });
  }
};

export const getPatientImages = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    const images = await db
      .select()
      .from(medicalImages)
      .where(eq(medicalImages.patientId, patientId));

    res.json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error('Get patient images error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve patient images',
    });
  }
};

export const updateImageReport = async (req: Request, res: Response) => {
  try {
    const { dicomId } = req.params;
    const { radiologistId, findings, reportStatus } = req.body;

    const updatedImage = await db
      .update(medicalImages)
      .set({
        radiologistId,
        findings,
        reportStatus,
        isProcessed: reportStatus === 'completed',
        updatedAt: new Date(),
      })
      .where(eq(medicalImages.dicomId, dicomId))
      .returning();

    if (updatedImage.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Medical image not found',
      });
    }

    res.json({
      success: true,
      message: 'Image report updated successfully',
      data: updatedImage[0],
    });
  } catch (error) {
    console.error('Update image report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update image report',
    });
  }
};

export const createImagingStudy = async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      studyDescription,
      modality,
      bodyPartExamined,
      orderingPhysician,
      performingPhysician,
      studyDate,
      priority,
      clinicalHistory,
    } = req.body;

    const studyInstanceUID = `STUDY_${Date.now()}_${patientId}`;
    const accessionNumber = `ACC_${Date.now()}`;

    const newStudy = await db.insert(imagingStudies).values({
      patientId,
      studyInstanceUID,
      accessionNumber,
      studyDescription,
      modality,
      bodyPartExamined,
      orderingPhysician,
      performingPhysician,
      studyDate: new Date(studyDate),
      priority: priority || 'routine',
      clinicalHistory,
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Imaging study created successfully',
      data: newStudy[0],
    });
  } catch (error) {
    console.error('Create imaging study error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create imaging study',
    });
  }
};

export const getImagingStudies = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    const studies = await db
      .select()
      .from(imagingStudies)
      .where(eq(imagingStudies.patientId, patientId));

    res.json({
      success: true,
      data: studies,
    });
  } catch (error) {
    console.error('Get imaging studies error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve imaging studies',
    });
  }
};

export const updateStudyStatus = async (req: Request, res: Response) => {
  try {
    const { studyId } = req.params;
    const { studyStatus, numberOfImages, studyComments } = req.body;

    const updatedStudy = await db
      .update(imagingStudies)
      .set({
        studyStatus,
        numberOfImages: numberOfImages || 0,
        studyComments,
        updatedAt: new Date(),
      })
      .where(eq(imagingStudies.id, studyId))
      .returning();

    if (updatedStudy.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Imaging study not found',
      });
    }

    res.json({
      success: true,
      message: 'Study status updated successfully',
      data: updatedStudy[0],
    });
  } catch (error) {
    console.error('Update study status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update study status',
    });
  }
};

export const getAllPendingReports = async (req: Request, res: Response) => {
  try {
    const pendingImages = await db
      .select()
      .from(medicalImages)
      .where(eq(medicalImages.reportStatus, 'pending'));

    res.json({
      success: true,
      data: pendingImages,
    });
  } catch (error) {
    console.error('Get pending reports error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve pending reports',
    });
  }
};